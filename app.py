import os
from flask import Flask, render_template, request, redirect, url_for, session,jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt 
import random
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
import datetime
from flask_migrate import Migrate

#variabili globali e inizializzazione

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your secret key'

#gestione accessibilità utente
# @app.route('/accessibility', methods=['GET', 'POST'])
# def accessibility():
#     data = request.json
#     session['acc'] = data.get('acc')
#     print(session['acc'])
#     return jsonify(data)

#gestione sidebar
# @app.route('/sidebar', methods=['GET', 'POST'])
# def sidebar():
#     data = request.json
#     session['side'] = data.get('side')
#     return jsonify(data)



# DATABASE CONFIGURATION

app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, 'database.db')
db = SQLAlchemy(app)

migrate = Migrate(app, db)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


class User(db.Model, UserMixin):
    __tablename__ = 'users'

    username = db.Column(db.String(255), primary_key=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    statistics = db.relationship("Statistic", backref="user", uselist=False)  # One-to-One with Statistic

    def get_id(self):
           return (self.username)

    def __repr__(self):
        return '<User %r>' % self.username

class Partita(db.Model):
    __tablename__ = 'games'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    player2 = db.Column(db.Integer, db.ForeignKey('users.username'), nullable=True)
    OraInizio = db.Column(db.DateTime, nullable=False)

class Statistic(db.Model):

    __tablename__ = 'statistics'

    user_id = db.Column(db.Integer, db.ForeignKey('users.username'), primary_key=True)
    id = db.Column(db.Integer, unique=True, nullable=False, autoincrement=True)
    wins = db.Column(db.Integer, nullable=False, default=0)
    losses = db.Column(db.Integer, nullable=False, default=0)
    p_gio_computer = db.Column(db.Integer, nullable=False, default=0)

class Obiettivo(db.Model):
    __tablename__ = 'objectives'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(255), nullable=False)
    descrizione = db.Column(db.String(255), nullable=False)
    stella = db.Column(db.Integer, nullable=False)

class SbloccaObiettivo(db.Model):
    __tablename__ = 'unlocked_objectives'

    user_id = db.Column(db.Integer, db.ForeignKey('users.username'), primary_key=True)
    obiettivo_id = db.Column(db.Integer, db.ForeignKey('objectives.id'), primary_key=True)
    data = db.Column(db.DateTime, nullable=False)

class Partita_online(db.Model):
    __tablename__ = 'online_games'

    id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True)

    oraFine1 = db.Column(db.DateTime, nullable=True) 
    oraFine2 = db.Column(db.DateTime, nullable=True)
    codice1 = db.Column(db.String(4), nullable=True)        # codice per il primo giocatore (creatore)
    codice2 = db.Column(db.String(4), nullable=True)        # codice per il secondo giocatore
    player1 = db.Column(db.Integer, db.ForeignKey('users.username'), nullable=False)

class Mossa(db.Model):
    __tablename__ = 'moves'

    user_id = db.Column(db.Integer, db.ForeignKey('users.username'), primary_key=True, nullable=False)
    partita_id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True, nullable=False)
    riga = db.Column(db.Integer, primary_key=True, nullable=False)
    colore = db.Column(db.String(4), nullable=False)

class Partita_computer(db.Model):

    __tablename__ = 'computer_games'

    id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True,autoincrement=True)
    difficolta = db.Column(db.Integer, nullable=False) # 1 = facile, 2 = medio, 3 = difficile
    oraFine = db.Column(db.DateTime, nullable=True) 

class CreaPartita(db.Model):

    __tablename__ = 'creations'

    user_id = db.Column(db.Integer, db.ForeignKey('users.username'))
    partita_id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True)

class Lobby(db.Model):
    
        __tablename__ = 'lobbies'
    
        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        codice = db.Column(db.String(6), unique=True, nullable=False)
        player1 = db.Column(db.Integer, db.ForeignKey('users.username'), nullable=False)
        idGame = db.Column(db.Integer, db.ForeignKey('games.id'), nullable=True)
        replay1 = db.Column(db.Boolean, nullable=False, default=False)               #se è una partita da rigiocare o no. all'inizio è false, viene messa a true 
        replay2 = db.Column(db.Boolean, nullable=False, default=False)

class EntraLobby(db.Model):
        
            __tablename__ = 'lobby_entries'
        
            user_id = db.Column(db.Integer, db.ForeignKey('users.username'))
            lobby_id = db.Column(db.Integer, db.ForeignKey('lobbies.id'), primary_key=True)

# Create tables in database (if not exist)
with app.app_context():
    db.create_all()

@login_manager.user_loader
def load_user(user_id):
    return User.query.filter_by(username=user_id).first()

#funzioni per la chiamata delle pagini html
@app.route('/', methods=['GET', 'POST'])
def index():
    clean()
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    clean()
    msg = ''
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']

        if username in [user.username for user in User.query.all()]:
            msg = 'Username già esistente'
            return render_template('auth/register.html', msg=msg)
        if email in [user.email for user in User.query.all()]:
            msg = 'Email già esistente'
            return render_template('auth/register.html', msg=msg)
        
        # Save hashed password to database for security purposes
        salt = bcrypt.gensalt() 
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bytes(salt))
        new_user = User(username=username, password=hashed_password, email=email)
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('login'))
    return render_template('auth/register.html')

@app.route('/login', methods=['GET', 'POST'])

def login():
    clean()
    msg = ''
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        user = User.query.filter_by(username=username).first()
    
        if user:
            session['username'] = username # Store username in session
            if user.password == bcrypt.hashpw(password.encode('utf-8'), user.password):
                login_user(user)
                return redirect(url_for('index'))
            else:
                msg = 'password errata'
        else:
            msg = 'Username non esistente'

    return render_template('auth/login.html', msg=msg)

@app.route('/logout')
@login_required
def logout():
    clean()
    session.pop('username', None)
    logout_user()
    return redirect(url_for('index'))

@app.route('/regole', methods=['GET', 'POST'])

def rules():
    clean()
    return render_template('rules.html')

@app.route('/about-us', methods=['GET', 'POST'])
def about_us():
    clean()
    return render_template('about_us.html')

@app.route('/contact-us', methods=['GET', 'POST'])
def contact_us():
    clean()
    return render_template('contact_us.html')

@app.route('/gioco-computer', methods=['GET', 'POST'])
def game():
    clean()
    return render_template('gameoffline.html')

@app.route('/online-game', methods=['GET', 'POST'])
@login_required
def gameonline():
    # fetch data from json request. It has to contain the id of the game and the code to win the game
    if request.method == 'POST':
        data = request.json
        game_id = data.get('id')
        code = data.get('code')
        lobby = Lobby.query.filter_by(idGame=game_id).first()
        online_game = Partita_online.query.filter_by(id=game_id).first()
        if lobby is not None:
            lobby.replay1 = False
            lobby.replay2 = False
            # if the current user is the creator of the lobby, update the code for the first player
            if lobby.player1 == current_user.username:
                if online_game is not None:
                    print("inserito")
                    online_game.codice1 = code
                    db.session.commit()
            # if the current user is the second player, update the code for the second player
            else:
                enter_lobby = EntraLobby.query.filter_by(lobby_id=lobby.id).first()
                if enter_lobby is not None:
                    if enter_lobby.user_id == current_user.username:
                        if online_game is not None:
                            print("inserito")
                            online_game.codice2 = code
                            db.session.commit()
        return jsonify({'id': game_id})
    else:
        id = request.args.get('id')
        print(str(id))
        lobby = Lobby.query.filter_by(idGame=id).first()
        if lobby is not None:
            lobby.replay1 = False
            lobby.replay2 = False
            db.session.commit()
        online_game = Partita_online.query.filter_by(id=id).first()

        partita = Partita.query.filter_by(id=id).first()
        code = ''
        if online_game is not None:
            if current_user.username == online_game.player1:
                print(current_user.username + " code to win: " + online_game.codice2)
                code = online_game.codice2
            else:
                code = online_game.codice1
            if current_user.username == online_game.player1:
                if online_game.oraFine1 is not None and online_game.oraFine2 is not None:
                    clean()
                    return render_template('index.html', stanzaErr="Hai già giocato questa partita")
            if current_user.username == partita.player2:
                if online_game.oraFine2 is not None and online_game.oraFine1 is not None:
                    clean()
                    return render_template('index.html', stanzaErr="Hai già giocato questa partita")
            if current_user.username != online_game.player1 and current_user.username != partita.player2:
                clean()
                return render_template('index.html', stanzaErr="Non puoi accedere a questa partita")
        else:
            clean()
            return render_template('index.html', stanzaErr="Partita inesistente")
        return render_template('gameonline.html', id=id, code=code)

@app.route('/lobby/', methods=['GET', 'POST'])
@login_required
def lobby():
    
    # select mode from url query string (create or enter)
    mode = request.args.get('mode')
    code = ''
    msg = ''

    if mode == 'create':
        msg='Hai creato una lobby'
        # check if user has already created a lobby (if so, doesn't change the code)
        lobby = Lobby.query.filter_by(player1=current_user.username).first()
        if lobby is not None:
            lobby.replay1 = True
            lobby.replay2 = True
            db.session.commit()
            code = lobby.codice

        # create a new lobby
        else:
            codeArray = random.choices('0123456789', k=6)                               #array of 6 random numbers
            code = ''.join(codeArray)                                                   #join the array to create a string
            new_lobby = Lobby(codice=code, player1=current_user.username)               #prepare the new lobby
            new_lobby.replay1 = False
            new_lobby.replay2 = False
            db.session.add(new_lobby)
            db.session.commit()

        # return the lobby page with the code, lobby creator and a message for the user 
        return render_template('lobby.html', code=code, creator=current_user.username, msg=msg, replay1=True, replay2=False)
    
    elif mode == 'enter':
        msg='Sei entrato in una lobby'
        # check if user has already entered a lobby (if so, doesn't change the code)
        enterLobby = EntraLobby.query.filter_by(user_id=current_user.username).first()
        if enterLobby is not None:
            lobby_id = enterLobby.lobby_id
            lobby = Lobby.query.filter_by(id=lobby_id).first()
            lobby.replay1 = True
            lobby.replay2 = True
            db.session.commit()
            code = lobby.codice
            return render_template('lobby.html', code=code, creator=Lobby.query.filter_by(id=lobby_id).first().player1, msg=msg, replay1=True, replay2=True)
        
        # enter a lobby with the code provided by the user
        code = request.form['code']
        if code == '':
            return render_template('index.html', code=code, err='Inserisci un codice')
        isCorrectLobby = Lobby.query.filter_by(codice = code).first()
        # if the lobby exists, add the user to the lobby
        if isCorrectLobby:
            if isCorrectLobby.player1 == current_user.username:
                return render_template('index.html', code=code, msg=current_user.username, err='Non puoi entrare nella tua lobby')
            # isCorrectLobby.replay1 = True
            isCorrectLobby.replay2 = True
            isThereAnotherPlayer = EntraLobby.query.filter_by(lobby_id=isCorrectLobby.id).first()
            if isThereAnotherPlayer is not None:
                return render_template('index.html', code=code, msg=current_user.username, err='Lobby piena')
            enter = EntraLobby(user_id=current_user.username, lobby_id=isCorrectLobby.id)
            db.session.add(enter)
            db.session.commit()
            return render_template('lobby.html', code=code, msg=msg, creator=isCorrectLobby.player1, replay1=True, replay2=True)
        
        # if the lobby doesn't exist, return the index page with an error message
        else:
            return render_template('index.html', code=code, err='Nessuna lobby disponibile con il codice inserito')

    return render_template('index.html', msg='Errore')

@app.route('/replay', methods=['GET', 'POST'])
@login_required
def replay():
    # select mode from url query string (create or enter)
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    if lobby is not None:
        lobby.replay1 = True
        db.session.commit()
        return render_template('lobby.html', code=lobby.codice, creator=current_user.username, msg='Hai creato una lobby', replay1=lobby.replay1, replay2=lobby.replay2)
    else:
        Entra = EntraLobby.query.filter_by(user_id=current_user.username).first()
        if Entra is not None:
            lobby = Lobby.query.filter_by(id=Entra.lobby_id).first()
            if lobby is not None:
                lobby.replay2 = True
                db.session.commit()
                return render_template('lobby.html', code=lobby.codice, creator=lobby.player1, msg='Sei entrato in una lobby', replay1=lobby.replay1, replay2=lobby.replay2)
    clean()
    return render_template('index.html', stanzaErr='Il creatore ha abbandonato la stanza', replay1=False, replay2=False)
# funzioni per il dialogo client-server
@app.route('/isConnected',methods=['GET', 'POST'])
def isConnected():
    isCreator = False
    if current_user.is_authenticated:
        lobby = Lobby.query.filter_by(player1=current_user.username).first()
        # if the user is not the creator of the lobby, either he is the second player or the creator has left his lobby
        if lobby is None:
            lobby = EntraLobby.query.filter_by(user_id=current_user.username).first()
            # if the user is the second player
            if lobby is not None:
                lobby = Lobby.query.filter_by(id=lobby.lobby_id).first()
                # if the creator has left the lobby
                if lobby is None:
                    return jsonify({'disconnect': True})
                else: 
                    return jsonify({'connected': True, 'creator': isCreator})
            # should never happen, or the lobby has been deleted or the user has been removed from the lobby
            return jsonify({'connected': False, 'creator': isCreator})
        # if the user is the creator of the lobby
        if lobby.player1 == current_user.username:
                isCreator = True
        enterLobby = EntraLobby.query.filter_by(lobby_id=lobby.id).first()
        # if the creator is still in the lobby and a second player has joined
        if lobby is not None and enterLobby is not None:
            return jsonify({'connected': True, 'username': enterLobby.user_id, 'creator': isCreator})
        else:
            return jsonify({'connected': False, 'creator': isCreator})
    # should never happen
    return jsonify({'connected': False})

@app.route('/errmsg', methods=['GET', 'POST'])
@login_required
def errmsg():
    clean()
    return render_template('index.html', stanzaErr='Un giocatore ha abbandonato la stanza')

@app.route('/leaveLobby', methods=['GET', 'POST'])
@login_required
def leaveLobby():
    clean()
    return render_template('index.html', stanzaErr='Il creatore ha abbandonato la stanza')

@app.route('/isReplay')
@login_required
def isReplay():
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    data = {'replay1': False, 'replay2': False, 'disconnect': False}
    if lobby is not None:
        
        data['replay1'] = lobby.replay1
        data['replay2'] = lobby.replay2
    else:
        
        enter = EntraLobby.query.filter_by(user_id=current_user.username).first()
        if enter is not None:
            lobby = Lobby.query.filter_by(id=enter.lobby_id).first()
            if lobby is not None:
                data['replay1'] = lobby.replay1
                data['replay2'] = lobby.replay2   
        else:
            data['disconnect'] = True
    return jsonify(data)

@app.route('/game-online-code', methods=['GET', 'POST'])
@login_required
def gameonlinecode():
    id = request.args.get('id')
    return render_template('gameonlinecode.html', id=id)


@app.route('/create-game', methods=['POST'])
@login_required
def create_game():
    
    data = request.json
    player2 = data.get('player2')
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    new_Game = Partita()
    new_Game.OraInizio = datetime.datetime.now()
    new_Game.player2 = player2
    db.session.add(new_Game)
    db.session.commit()
    # Crea una partita online
    online_game = Partita_online()
    online_game.id = new_Game.id
    online_game.player1 = current_user.username
    db.session.add(online_game)
    db.session.commit()
    # Aggiorna la lobby con l'id della partita
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    print(current_user.username + "is calling this function")
    print(lobby)
    if lobby is not None:
        lobby.idGame = new_Game.id
        print("lobby id: " + str(lobby.idGame))
        db.session.commit()
    data = {'id': new_Game.id}
    return jsonify(data)

@app.route('/insert-code', methods=['POST'])
def insert_code():
    if current_user.is_authenticated:
        data = request.json
        code = data.get('code')  # Estrai il valore del campo 'code'
        id_game = data.get('id')  # Estrai il valore del campo 'id'
        player = data.get('player')  # Estrai il valore del campo 'player2'
        online_game = Partita_online.query.filter_by(id=id_game).first()
        if online_game is None:
            return jsonify({'error': 'Partita non trovata'})
        if player == online_game.player1:
            online_game.codice1 = code
        else:
            online_game.codice2 = code
        db.session.commit()
        print(code)
        return jsonify(data)

@app.route('/isCreated', methods=['POST'])
@login_required
def isCreated():
    
    lobby = Lobby.query.filter_by(player1=current_user.username).first()
    if lobby is not None:
        if lobby.idGame is not None:
            return jsonify({'created': True, 'id': lobby.idGame})
        else:
            return jsonify({'created': False, 'id': lobby.idGame})
    else:
        enterLobby = EntraLobby.query.filter_by(user_id=current_user.username).first()
        if enterLobby is not None:
            lobby = Lobby.query.filter_by(id=enterLobby.lobby_id).first()
            if lobby.idGame is not None:
                return jsonify({'created': True, 'id': lobby.idGame})
            else:
                return jsonify({'created': False, 'id': lobby.idGame})
    return jsonify({'created': False, 'id': lobby.idGame})

@app.route('/registerMove', methods=['POST'])
@login_required
def registerMove():
    data = request.json
    id_game = data.get('gameID')
    row = data.get('row')
    code = data.get('code')
    new_move = Mossa.query.filter_by(partita_id=id_game, user_id=current_user.username, riga=row).first()
    if new_move is not None:
        return jsonify(data)
    new_move = Mossa(user_id=current_user.username, partita_id=id_game, riga=row, colore=code)
    print('Mossa registrata' + str(new_move))
    db.session.add(new_move)
    db.session.commit()
    return jsonify(data)

@app.route('/endGame', methods=['POST'])
@login_required
def endGame():
    data = request.json
    id_game = data.get('gameID')
    player = data.get('winner')
    time = data.get('time')
    print(time)
    print(datetime.datetime.now())
    online_game = Partita_online.query.filter_by(id=id_game).first()
    if online_game is not None:
        if player == online_game.player1:
            if online_game.oraFine1 is None:
                online_game.oraFine1 = datetime.datetime.strptime(time, '%Y-%m-%d %H:%M:%S')
        else:
            if online_game.oraFine2 is None:
                online_game.oraFine2 = datetime.datetime.strptime(time, '%Y-%m-%d %H:%M:%S')
        db.session.commit()

    return jsonify(data)

@app.route('/hasEnded', methods=['POST'])
@login_required
def hasEnded():
    data = request.json
    id_game = data.get('gameID')
    data = ({'ended': False, 'winner': ''})
    online_game = Partita_online.query.filter_by(id=id_game).first()

    if online_game is not None:
        # if both players have ended the game, either by winning or by leaving the game
        print(online_game.oraFine1)
        print(online_game.oraFine2)
        if online_game.oraFine1 is not None and online_game.oraFine2 is not None:
            partita = Partita.query.filter_by(id=id_game).first()
            maxRowMoves1 = Mossa.query.filter_by(partita_id=id_game, user_id=online_game.player1).order_by(Mossa.riga.desc()).first()
            maxRowMoves2 = Mossa.query.filter_by(partita_id=id_game, user_id=partita.player2).order_by(Mossa.riga.desc()).first()
            # if no player has played any move, the game is a lost for both
            if maxRowMoves1 is None and maxRowMoves2 is None:
                data['winner'] = 'lost'
            elif maxRowMoves1 is not None and maxRowMoves2 is None:
                if maxRowMoves1.colore == online_game.codice2:
                    data['winner'] = online_game.player1
                else:
                    data['winner'] = 'lost'
            elif maxRowMoves1 is None and maxRowMoves2 is not None:
                if maxRowMoves2.colore == online_game.codice1:
                    data['winner'] = partita.player2
                else:
                    data['winner'] = 'lost'
            # if both players have won the game, the winner is the one with the lowest tries. If the tries are the same, the winner is the one who finished the game first
            elif maxRowMoves1.colore == online_game.codice2 and maxRowMoves2.colore == online_game.codice1:
                    if maxRowMoves1.riga < maxRowMoves2.riga:
                        data['winner'] = online_game.player1
                    elif maxRowMoves1.riga > maxRowMoves2.riga:
                        data['winner'] = partita.player2
                    else:
                        datetime1 = online_game.oraFine1
                        datetime2 = online_game.oraFine2

                        if datetime1 > datetime2:
                            data['winner'] = online_game.player1
                        elif datetime1 < datetime2:
                            data['winner'] = partita.player2
                        else:
                            if datetime1.year != 2000 or datetime2.year != 2000:
                                data['winner'] = 'error'
                            else:
                                data['winner'] = 'draw'
            # if only one player has won the game, the other player either lost or left the game
            elif maxRowMoves1.colore == online_game.codice1:
                data['winner'] = online_game.player1
            # if only one player has won the game, the other player either lost or left the game
            elif maxRowMoves2.colore == online_game.codice2:
                data['winner'] = partita.player2
            # if both players have lost the game, the game is a lost for both
            else:
                data['winner'] = 'lost' 
            data['ended'] = True
    
    return jsonify(data)

@app.route('/hasInsertedCode', methods=['POST'])
@login_required
def hasInsertedCode():
    data = request.json
    id_game = data.get('id')
    online_game = Partita_online.query.filter_by(id=id_game).first()

    if online_game is not None:
        if online_game.codice1 is not None and online_game.codice2 is not None:
            return jsonify({'inserted': True})
    return jsonify({'inserted': False})

@app.route('/getMoves', methods=['POST'])
@login_required
def getMoves():
    data = request.json
    id_game = data.get('gameID')
    moves = Mossa.query.filter_by(partita_id=id_game, user_id=current_user.username).all()
    movesArray = []
    for move in moves:
        movesArray.append({'row': move.riga, 'code': move.colore})
    return jsonify(movesArray)

@app.route('/getSecretCode', methods=['POST'])
@login_required
def getSecretCode():
    data = request.json
    id_game = data.get('id')
    online_game = Partita_online.query.filter_by(id=id_game).first()
    code = ''
    if online_game is not None:
        if current_user.username == online_game.player1:
            if online_game.codice1 is not None:
                code = online_game.codice1
        else:
            if online_game.codice2 is not None:
                code = online_game.codice2
    print(id_game)
    print(code)
    return jsonify({'code': code})

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

@app.route('/forceEndGame', methods=['POST'])
@login_required
def forceEndGame():
    data = request.json
    id_game = data.get('gameID')
    online_game = Partita_online.query.filter_by(id=id_game).first()
    if online_game is not None:
        if online_game.oraFine1 is None:
                online_game.oraFine1 = datetime.datetime.now()
        if online_game.oraFine2 is None:
                online_game.oraFine2 = datetime.datetime.now()
        db.session.commit()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)