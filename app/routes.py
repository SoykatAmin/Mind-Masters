from flask import Blueprint, render_template, redirect, url_for, request, session, jsonify
from flask_login import login_required, logout_user
from app.models import *
from app.services import *

main_bp = Blueprint('main', __name__)

@main_bp.route('/', methods=['GET', 'POST'])
def index():
    clean()
    return render_template('index.html')

@main_bp.route('/register', methods=['GET', 'POST'])
def register():
    clean()
    msg = ''
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']

        # Usa la funzione di servizio per registrare l'utente
        msg = register_user(username, password, email)
        if msg:  # Se c'è un messaggio, significa che c'è stato un errore
            return render_template('auth/register.html', msg=msg)

        return redirect(url_for('main.login'))

    return render_template('auth/register.html')

@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    clean()
    msg = ''
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        # Autentica l'utente utilizzando la funzione di servizio
        user, msg = authenticate_user(username, password)

        if user:
            session['username'] = username  # Memorizza l'username nella sessione
            return redirect(url_for('main.index'))

    return render_template('auth/login.html', msg=msg)

@main_bp.route('/logout')
@login_required
def logout():
    clean()
    session.pop('username', None)
    logout_user()
    return redirect(url_for('index'))

@main_bp.route('/regole', methods=['GET', 'POST'])
def rules():
    clean()
    return render_template('rules.html')

@main_bp.route('/about-us', methods=['GET', 'POST'])
def about_us():
    clean()
    return render_template('about_us.html')

@main_bp.route('/contact-us', methods=['GET', 'POST'])
def contact_us():
    clean()
    return render_template('contact_us.html')

@main_bp.route('/gioco-computer', methods=['GET', 'POST'])
def game():
    clean()
    return render_template('gameoffline.html')

@main_bp.route('/online-game', methods=['GET', 'POST'])
@login_required
def gameonline():
    clean()
    
    if request.method == 'POST':
        data = request.json
        game_id = data.get('id')
        code = data.get('code')

        update_game_code(game_id, code)
        return jsonify({'id': game_id})

    else:
        game_id = request.args.get('id')
        code, error_msg = get_game_data(game_id)
        
        if error_msg:
            clean()
            return render_template('index.html', stanzaErr=error_msg)
        
        return render_template('gameonline.html', id=game_id, code=code)
    
@main_bp.route('/lobby/', methods=['GET', 'POST'])
@login_required
def lobby():
    clean()
    mode = request.args.get('mode')
    code = ''
    msg = ''

    if mode == 'create':
        code, is_existing = create_or_get_lobby_for_user()
        msg = 'Hai creato una lobby' if not is_existing else 'Lobby esistente trovata'
        return render_template('lobby.html', code=code, creator=current_user.username, msg=msg, replay1=True, replay2=False)
    
    elif mode == 'enter':
        lobby = get_lobby_for_user()
        if lobby:
            code = lobby.codice
            msg = 'Sei entrato in una lobby'
            return render_template('lobby.html', code=code, creator=lobby.player1, msg=msg, replay1=True, replay2=True)
        
        code = request.form.get('code', '')
        if not code:
            return render_template('index.html', err='Inserisci un codice')

        lobby, err = enter_lobby_with_code(code)
        if lobby:
            msg = 'Sei entrato in una lobby'
            return render_template('lobby.html', code=lobby.codice, creator=lobby.player1, msg=msg, replay1=True, replay2=True)
        else:
            return render_template('index.html', err=err)

    return render_template('index.html', msg='Errore')

@main_bp.route('/replay', methods=['GET', 'POST'])
@login_required
def replay():
    clean()
    
    lobby, is_creator = set_replay_status_for_user()
    if lobby:
        if is_creator:
            return render_template('lobby.html', code=lobby.codice, creator=current_user.username, msg='Hai creato una lobby', replay1=lobby.replay1, replay2=lobby.replay2)
        else:
            return render_template('lobby.html', code=lobby.codice, creator=lobby.player1, msg='Sei entrato in una lobby', replay1=lobby.replay1, replay2=lobby.replay2)

    return render_template('index.html', stanzaErr='Il creatore ha abbandonato la lobby', replay1=False, replay2=False)

@main_bp.route('/isConnected', methods=['GET', 'POST'])
def isConnected():
    response = check_user_connection()
    return jsonify(response)

@main_bp.route('/errmsg', methods=['GET', 'POST'])
@login_required
def errmsg():
    clean()
    return render_template('index.html', stanzaErr='Un giocatore ha abbandonato la lobby')

@main_bp.route('/leaveLobby', methods=['GET', 'POST'])
@login_required
def leaveLobby():
    clean()
    return render_template('index.html', stanzaErr='Il creatore ha abbandonato la lobby')

@main_bp.route('/isReplay')
@login_required
def isReplay():
    data = check_replay_status()
    return jsonify(data)

@main_bp.route('/game-online-code', methods=['GET', 'POST'])
@login_required
def gameonlinecode():
    id = request.args.get('id')
    return render_template('gameonlinecode.html', id=id)

@main_bp.route('/create-game', methods=['POST'])
@login_required
def create_game():
    data = request.json
    player2 = data.get('player2')
    
    game_id = create_game_and_update_lobby(player2)
    
    return jsonify({'id': game_id})

@main_bp.route('/insert-code', methods=['POST'])
@login_required
def insert_code():
    data = request.json
    code = data.get('code')
    id_game = data.get('id')
    player = data.get('player')
    
    result = insert_code_into_game(id_game, code, player)
    
    return jsonify(result)

@main_bp.route('/isCreated', methods=['POST'])
@login_required
def isCreated():
    status = check_game_creation_status()
    return jsonify(status)

@main_bp.route('/registerMove', methods=['POST'])
@login_required
def registerMove():
    data = request.json
    id_game = data.get('gameID')
    row = data.get('row')
    code = data.get('code')
    
    result = register_move(id_game, row, code)
    
    return jsonify(result)

@main_bp.route('/endGame', methods=['POST'])
@login_required
def endGame():
    data = request.json
    id_game = data.get('gameID')
    player = data.get('winner')
    time = data.get('time')
    
    result = end_game(id_game, player, time)
    
    return jsonify(result)

@main_bp.route('/hasEnded', methods=['POST'])
@login_required
def hasEnded():
    data = request.json
    id_game = data.get('gameID')
    
    result = check_game_status(id_game)
    
    return jsonify(result)

@main_bp.route('/hasInsertedCode', methods=['POST'])
@login_required
def hasInsertedCode():
    data = request.json
    id_game = data.get('id')

    result = check_code_insertion(id_game)
    
    return jsonify(result)

@main_bp.route('/getMoves', methods=['POST'])
@login_required
def getMoves():
    data = request.json
    id_game = data.get('gameID')

    moves = get_moves_for_game(id_game, current_user.username)
    
    return jsonify(moves)

@main_bp.route('/getSecretCode', methods=['POST'])
@login_required
def getSecretCode():
    data = request.json
    id_game = data.get('id')

    code = get_secret_code_for_game(id_game, current_user.username)
    
    return jsonify({'code': code})

@main_bp.route('/forceEndGame', methods=['POST'])
@login_required
def forceEndGame():
    data = request.json
    id_game = data.get('gameID')

    success = force_end_game(id_game)
    
    return jsonify({'success': success})

@main_bp.route('/resultOffline', methods=['POST'])
def resultOffline():
    data = request.json
    difficoltà = data.get('difficoltà')
    win = data.get('win')
    time = datetime.datetime.now()

    if difficoltà == 'facile':
    
    p_offline = Partita_computer(oraFine=time, player1=current_user.username)
    creaPartita = CreaPartita(user_id=current_user.username, partita_id=p_offline.id)
    db.session.add(p_offline)
    db.session.add(creaPartita)
    db.session.commit()
    
    return jsonify(result)
