from app import db
from flask_login import current_user, login_user
from app.models import *
from app import login_manager
import datetime
import bcrypt
import random

def clean():
    if current_user.is_authenticated:
        print("clean")
        lobby = Lobby.query.filter_by(player1=current_user.username).first()
        if lobby is not None:
            online_game = Partita_online.query.filter_by(id=lobby.idGame).first()
            if online_game is not None:
                if online_game.oraFine1 is None:
                    online_game.oraFine1 = datetime.datetime.now()
                    db.session.commit()
        EntraLobby1 = EntraLobby.query.filter_by(user_id=current_user.username).first()
        if EntraLobby1 is not None:
            lobby = Lobby.query.filter_by(id=EntraLobby1.lobby_id).first()
            if lobby is not None:
                online_game = Partita_online.query.filter_by(id=lobby.idGame).first()
                if online_game is not None:
                    if online_game.oraFine2 is None:
                        online_game.oraFine2 = datetime.datetime.now()
                        db.session.commit()
            EntraLobby.query.filter_by(user_id=current_user.username).delete()
        Lobby.query.filter_by(player1=current_user.username).delete()
        db.session.commit()
        return

def register_user(username, password, email):
    # Controlla se l'username esiste già
    if username in [user.username for user in User.query.all()]:
        return 'Username già esistente'
    
    # Controlla se l'email esiste già
    if email in [user.email for user in User.query.all()]:
        return 'Email già esistente'
    
    # Crittografa la password e salva il nuovo utente nel database
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bytes(salt))
    new_user = User(username=username, password=hashed_password, email=email)
    db.session.add(new_user)
    db.session.commit()

    statistic = Statistic(user_id=username)
    db.session.add(statistic)
    db.session.commit()
    
    return None  # Nessun errore, registrazione avvenuta con successo

def authenticate_user(username, password):
    user = User.query.filter_by(username=username).first()
    statistic = Statistic.query.filter_by(user_id=username).first()
    if statistic is None:
        statistic = Statistic(user_id=username)
        db.session.add(statistic)
        db.session.commit()
    if user:
        # Verifica la password
        if bcrypt.hashpw(password.encode('utf-8'), user.password) == user.password:
            login_user(user)  # Effettua il login dell'utente tramite Flask-Login
            return user, None  # Restituisce l'utente e nessun messaggio di errore
        else:
            return None, 'Password errata'
    else:
        return None, 'Username non esistente'
    
def update_game_code(game_id, code):
    lobby = Lobby.query.filter_by(idGame=game_id).first()
    online_game = Partita_online.query.filter_by(id=game_id).first()
    if lobby is not None:
        lobby.replay1 = False
        lobby.replay2 = False
        if lobby.player1 == current_user.username:
            if online_game is not None:
                online_game.codice1 = code
                db.session.commit()
        else:
            enter_lobby = EntraLobby.query.filter_by(lobby_id=lobby.id).first()
            if enter_lobby is not None and enter_lobby.user_id == current_user.username:
                if online_game is not None:
                    online_game.codice2 = code
                    db.session.commit()

def get_game_data(game_id):
    lobby = Lobby.query.filter_by(idGame=game_id).first()
    online_game = Partita_online.query.filter_by(id=game_id).first()
    partita = Partita.query.filter_by(id=game_id).first()
    code = ''
    
    if online_game is not None:
        if current_user.username == online_game.player1:
            code = online_game.codice2
        else:
            code = online_game.codice1

        if current_user.username == online_game.player1:
            if online_game.oraFine1 is not None and online_game.oraFine2 is not None:
                return None, "Hai già giocato questa partita"
        if current_user.username == partita.player2:
            if online_game.oraFine2 is not None and online_game.oraFine1 is not None:
                return None, "Hai già giocato questa partita"
        if current_user.username != online_game.player1 and current_user.username != partita.player2:
            return None, "Non puoi accedere a questa partita"
    else:
        return None, "Partita inesistente"

    if lobby is not None:
        lobby.replay1 = False
        lobby.replay2 = False
        db.session.commit()

    return code, None

def create_or_get_lobby_for_user():
    """Crea una lobby o recupera quella esistente per l'utente corrente."""
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    if lobby is not None:
        lobby.replay1 = True
        lobby.replay2 = True
        db.session.commit()
        return lobby.codice, True
    
    # Creazione di una nuova lobby
    codeArray = random.choices('0123456789', k=6)
    code = ''.join(codeArray)
    new_lobby = Lobby(codice=code, player1=current_user.username)
    new_lobby.replay1 = False
    new_lobby.replay2 = False
    db.session.add(new_lobby)
    db.session.commit()
    
    return code, False

def enter_lobby_with_code(code):
    """Gestisce l'ingresso di un utente in una lobby con il codice fornito."""
    isCorrectLobby = Lobby.query.filter_by(codice=code).first()
    if isCorrectLobby:
        if isCorrectLobby.player1 == current_user.username:
            return None, 'Non puoi entrare nella tua lobby'

        if EntraLobby.query.filter_by(lobby_id=isCorrectLobby.id).first() is not None:
            return None, 'Lobby piena'

        # Aggiunge l'utente alla lobby
        enter = EntraLobby(user_id=current_user.username, lobby_id=isCorrectLobby.id)
        isCorrectLobby.replay2 = True
        db.session.add(enter)
        db.session.commit()
        return isCorrectLobby, None

    return None, 'Nessuna lobby disponibile con il codice inserito'

def get_lobby_for_user():
    """Recupera la lobby in cui l'utente è già entrato."""
    enterLobby = EntraLobby.query.filter_by(user_id=current_user.username).first()
    if enterLobby:
        lobby = Lobby.query.filter_by(id=enterLobby.lobby_id).first()
        if lobby:
            lobby.replay1 = True
            lobby.replay2 = True
            db.session.commit()
            return lobby
    return None

def set_replay_status_for_user():
    """Imposta lo stato di replay per l'utente corrente."""
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    if lobby:
        lobby.replay1 = True
        db.session.commit()
        return lobby, True

    Entra = EntraLobby.query.filter_by(user_id=current_user.username).first()
    if Entra:
        lobby = Lobby.query.filter_by(id=Entra.lobby_id).first()
        if lobby:
            lobby.replay2 = True
            db.session.commit()
            return lobby, False

    return None, None

def check_user_connection():
    """Verifica se l'utente è connesso e se è il creatore della lobby."""
    isCreator = False
    if current_user.is_authenticated:
        lobby = Lobby.query.filter_by(player1=current_user.username).first()
        
        if lobby is None:
            # L'utente non è il creatore della lobby, potrebbe essere il secondo giocatore o la lobby è stata abbandonata
            lobby = EntraLobby.query.filter_by(user_id=current_user.username).first()
            if lobby is not None:
                lobby = Lobby.query.filter_by(id=lobby.lobby_id).first()
                if lobby is None:
                    return {'disconnect': True}
                else:
                    return {'connected': True, 'creator': isCreator}
            return {'connected': False, 'creator': isCreator}
        
        if lobby.player1 == current_user.username:
            isCreator = True

        enterLobby = EntraLobby.query.filter_by(lobby_id=lobby.id).first()
        if lobby is not None and enterLobby is not None:
            return {'connected': True, 'username': enterLobby.user_id, 'creator': isCreator}
        else:
            return {'connected': False, 'creator': isCreator}

    return {'connected': False}

def check_replay_status():
    """Verifica lo stato di replay dell'utente corrente."""
    data = {'replay1': False, 'replay2': False, 'disconnect': False}
    
    # Verifica se l'utente è il creatore della lobby
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    if lobby is not None:
        data['replay1'] = lobby.replay1
        data['replay2'] = lobby.replay2
    else:
        # Verifica se l'utente è entrato in una lobby
        enter = EntraLobby.query.filter_by(user_id=current_user.username).first()
        if enter is not None:
            lobby = Lobby.query.filter_by(id=enter.lobby_id).first()
            if lobby is not None:
                data['replay1'] = lobby.replay1
                data['replay2'] = lobby.replay2
        else:
            data['disconnect'] = True

    return data

def create_game_and_update_lobby(player2):
    """Crea una nuova partita, aggiorna la partita online e la lobby."""
    # Crea una nuova partita
    new_game = Partita()
    new_game.OraInizio = datetime.datetime.now()
    new_game.player2 = player2
    db.session.add(new_game)
    db.session.commit()

    # Crea una partita online associata
    online_game = Partita_online()
    online_game.id = new_game.id
    online_game.player1 = current_user.username
    db.session.add(online_game)
    db.session.commit()

    # Aggiorna la lobby con l'ID della partita
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    if lobby is not None:
        lobby.idGame = new_game.id
        db.session.commit()

    return new_game.id

def insert_code_into_game(id_game, code, player):
    """Inserisce il codice nella partita online per il giocatore specificato."""
    online_game = Partita_online.query.filter_by(id=id_game).first()
    if online_game is None:
        return {'error': 'Partita non trovata'}
    
    if player == online_game.player1:
        online_game.codice1 = code
    else:
        online_game.codice2 = code
    
    db.session.commit()
    return {'code': code}

def check_game_creation_status():
    """Verifica se l'utente ha creato una partita e restituisce lo stato e l'ID della partita."""
    # Verifica se l'utente è il creatore della lobby
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    if lobby is not None:
        if lobby.idGame is not None:
            return {'created': True, 'id': lobby.idGame}
        else:
            return {'created': False, 'id': None}
    
    # Verifica se l'utente è entrato in una lobby
    enter_lobby = EntraLobby.query.filter_by(user_id=current_user.username).first()
    if enter_lobby is not None:
        lobby = Lobby.query.filter_by(id=enter_lobby.lobby_id).first()
        if lobby and lobby.idGame is not None:
            return {'created': True, 'id': lobby.idGame}
        else:
            return {'created': False, 'id': None}

    # Se l'utente non è né il creatore né un membro di una lobby con partita
    return {'created': False, 'id': None}

def register_move(id_game, row, code):
    """Registra un nuovo movimento nel gioco specificato."""
    # Verifica se il movimento esiste già
    existing_move = Mossa.query.filter_by(partita_id=id_game, user_id=current_user.username, riga=row).first()
    if existing_move is not None:
        return {'error': 'Movimento già registrato'}

    # Crea un nuovo movimento
    new_move = Mossa(user_id=current_user.username, partita_id=id_game, riga=row, colore=code)
    db.session.add(new_move)
    db.session.commit()
    
    return {'success': True, 'gameID': id_game, 'row': row, 'code': code}

def end_game(id_game, player, time):
    """Termina il gioco specificato e aggiorna l'orario di fine per il giocatore."""
    # Trova la partita online
    online_game = Partita_online.query.filter_by(id=id_game).first()
    if online_game is not None:
        # Converti il tempo dal formato stringa a un oggetto datetime
        end_time = datetime.datetime.strptime(time, '%Y-%m-%d %H:%M:%S')
        
        # Aggiorna l'orario di fine per il giocatore specificato
        if player == online_game.player1:
            if online_game.oraFine1 is None:
                online_game.oraFine1 = end_time
        else:
            if online_game.oraFine2 is None:
                online_game.oraFine2 = end_time
        
        # Salva le modifiche al database
        db.session.commit()
        return {'success': True, 'gameID': id_game, 'winner': player}
    
    return {'error': 'Partita non trovata'}

def check_game_status(id_game):
    """Controlla se il gioco è finito e determina il vincitore."""
    data = {'ended': False, 'winner': ''}
    online_game = Partita_online.query.filter_by(id=id_game).first()
    statistic1 = Statistic.query.filter_by(user_id=online_game.player1).first()
    statistic2 = Statistic.query.filter_by(user_id=online_game.player2).first()

    if online_game is not None:
        if online_game.oraFine1 is not None and online_game.oraFine2 is not None:
            partita = Partita.query.filter_by(id=id_game).first()
            maxRowMoves1 = Mossa.query.filter_by(partita_id=id_game, user_id=online_game.player1).order_by(Mossa.riga.desc()).first()
            maxRowMoves2 = Mossa.query.filter_by(partita_id=id_game, user_id=partita.player2).order_by(Mossa.riga.desc()).first()
            
            # Determina il risultato basato sui movimenti e sul codice del gioco
            if maxRowMoves1 is None and maxRowMoves2 is None:
                data['winner'] = 'lost'
            elif maxRowMoves1 is not None and maxRowMoves2 is None:
                if maxRowMoves1.colore == online_game.codice2:
                    data['winner'] = online_game.player1
                    statistic1.wins += 1
                    statistic2.losses += 1
                else:
                    data['winner'] = partita.player2
                    statistic2.wins += 1
                    statistic1.losses += 1
            elif maxRowMoves1 is None and maxRowMoves2 is not None:
                if maxRowMoves2.colore == online_game.codice1:
                    data['winner'] = partita.player2
                    statistic2.wins += 1
                    statistic1.losses += 1
                else:
                    data['winner'] = online_game.player1
                    statistic1.wins += 1
                    statistic2.first().losses += 1
            elif maxRowMoves1.colore == online_game.codice2 and maxRowMoves2.colore == online_game.codice1:
                if maxRowMoves1.riga < maxRowMoves2.riga:
                    data['winner'] = online_game.player1
                    statistic1.wins += 1
                    statistic2.losses += 1
                elif maxRowMoves1.riga > maxRowMoves2.riga:
                    data['winner'] = partita.player2
                    statistic2.wins += 1
                    statistic1.losses += 1
                else:
                    datetime1 = online_game.oraFine1
                    datetime2 = online_game.oraFine2
                    if datetime1 > datetime2:
                        data['winner'] = online_game.player1
                        statistic1.wins += 1
                        statistic2.losses += 1
                    elif datetime1 < datetime2:
                        data['winner'] = partita.player2
                        statistic2.wins += 1
                        statistic1.losses += 1
                    else:
                        if datetime1.year == 2000 and datetime2.year == 2000:
                            data['winner'] = 'draw'
                            statistic1.draws += 1
                            statistic2.draws += 1
            elif maxRowMoves1.colore == online_game.codice1:
                data['winner'] = online_game.player1
                statistic1.wins += 1
                statistic2.losses += 1
            elif maxRowMoves2.colore == online_game.codice2:
                data['winner'] = partita.player2
                statistic2.wins += 1
                statistic1.losses += 1
            else:
                data['winner'] = 'lost'
                statistic1.losses += 1
                statistic2.losses += 1
            data['ended'] = True
            db.session.commit()

    return data

def check_code_insertion(id_game):
    """Controlla se i codici sono stati inseriti per la partita specificata."""
    online_game = Partita_online.query.filter_by(id=id_game).first()

    if online_game is not None:
        if online_game.codice1 is not None and online_game.codice2 is not None:
            return {'inserted': True}
    
    return {'inserted': False}

def get_moves_for_game(id_game, username):
    """Recupera i movimenti effettuati da un giocatore in una partita."""
    moves = Mossa.query.filter_by(partita_id=id_game, user_id=username).all()
    moves_array = [{'row': move.riga, 'code': move.colore} for move in moves]
    return moves_array

def get_secret_code_for_game(id_game, username):
    """Recupera il codice segreto per una partita specifica e un giocatore."""
    online_game = Partita_online.query.filter_by(id=id_game).first()
    if online_game:
        if username == online_game.player1:
            return online_game.codice1 if online_game.codice1 is not None else ''
        else:
            return online_game.codice2 if online_game.codice2 is not None else ''
    return ''

def force_end_game(id_game):
    """Forza la terminazione di una partita impostando i tempi di fine per entrambi i giocatori."""
    online_game = Partita_online.query.filter_by(id=id_game).first()
    if online_game:
        if online_game.oraFine1 is None:
            online_game.oraFine1 = datetime.datetime.now()
        if online_game.oraFine2 is None:
            online_game.oraFine2 = datetime.datetime.now()
        db.session.commit()
        return True
    return False



@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(username=user_id).first()