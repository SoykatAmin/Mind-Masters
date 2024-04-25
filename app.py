import os
from flask import Flask, render_template, request, redirect, url_for, session,jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt 
import random
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user


#classe per connessione partita  
#TODO: implementare le partite nel database

class Partita:
    def __init__(self):
        self.player=[]#dentro player ci sono gli username dei giocatori
        self.game_code=random.randint(100000,999999)#codice partita per collegarsi
        self.vincitore=None
        self.mosse=[]
        self.tempi=[]

    def creaStanza(self, player):
        self.player.append(player)
        return self.game_code
    
    
    def entraStanza(self, player, code):
        if len(self.player)==1 and code==str(self.game_code):
            self.player.append(player)
            return True
        else:
            #stanza piena
            return False

    
    def fine_gioco(self):
        if len(self.mosse)==len(self.player) and len(self.tempi)==len(self.player):
            if self.mosse[0]<self.mosse[1]:
                self.vincitore=self.player[0]
            elif self.mosse[0]>self.mosse[1]:
                self.vincitore=self.player[1]
            else:
                if self.tempi[0]<self.tempi[1]:
                    self.vincitore=self.player[0]
                elif self.tempi[0]>self.tempi[1]:
                    self.vincitore=self.player[1]
                else:
                    #pareggio
                    self.vincitore=None
        else:
            #non hanno finito entrambi
            return False
        return self.vincitore

    def player_end(self, mossa, tempo, player):
        index = self.player.index(player)
        self.mosse.insert(index, mossa)
        self.tempi.insert(index, tempo)
        return self.fine_gioco()
        
    def player_ingame(self, player):
        return player in self.player

    def get_adm(self):
        return self.player[0]
    
    def esci_stanza(self, player):
        if self.player[0]==player:
            self.player.remove(player)
            return False
        else:
            self.player.remove(player)
            return True
        
    def game_check(self):
        return len(self.player)==2
       

#variabili globali e inizializzazione

basedir = os.path.abspath(os.path.dirname(__file__))
partite=[]#lista delle partite in corso
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your secret key'

#gestione accessibilità utente


# DATABASE CONFIGURATION

app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, 'database.db')
db = SQLAlchemy(app)
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
    player2 = db.Column(db.Integer, db.ForeignKey('users.username'), nullable=False)

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

    id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True,autoincrement=True)

    oraFine1 = db.Column(db.DateTime, nullable=True) 
    oraFine2 = db.Column(db.DateTime, nullable=True)
    codice1 = db.Column(db.String(4), nullable=True)
    codice2 = db.Column(db.String(4), nullable=True)
    player1 = db.Column(db.Integer, db.ForeignKey('users.username'), nullable=False)

class Mossa(db.Model):
    __tablename__ = 'moves'

    user_id = db.Column(db.Integer, db.ForeignKey('users.username'), nullable=False)
    partita_id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True, nullable=False)
    riga = db.Column(db.Integer, primary_key=True, nullable=False)
    colonna = db.Column(db.Integer, primary_key=True, nullable=False)
    colore = db.Column(db.String(255), nullable=False)

class Partita_computer(db.Model):

    __tablename__ = 'computer_games'

    partita_id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True, nullable=False)
    difficolta = db.Column(db.Integer, nullable=False) # 1 = facile, 2 = medio, 3 = difficile

class EntraPartita(db.Model):

    __tablename__ = 'entries'

    user_id = db.Column(db.Integer, db.ForeignKey('users.username'))
    partita_id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True)

class CreaPartita(db.Model):

    __tablename__ = 'creations'

    user_id = db.Column(db.Integer, db.ForeignKey('users.username'))
    partita_id = db.Column(db.Integer, db.ForeignKey('games.id'), primary_key=True)

class Lobby(db.Model):
    
        __tablename__ = 'lobbies'
    
        id = db.Column(db.Integer, primary_key=True, autoincrement=True)
        codice = db.Column(db.String(6), unique=True, nullable=False)
        player1 = db.Column(db.Integer, db.ForeignKey('users.username'), nullable=False)

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

    if current_user.is_authenticated:
        Lobby.query.filter_by(player1=current_user.username).delete()
        EntraLobby.query.filter_by(user_id=current_user.username).delete()
        db.session.commit()
        return render_template('index.html', msg=current_user.username)
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])

def register():
    msg = ''
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']

        if username in [user.username for user in User.query.all()]:
            msg = 'Username already exists'
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
                msg = 'Incorrect password'
        else:
            msg = 'Username does not exist'

    return render_template('auth/login.html', msg=msg)

@app.route('/logout')
@login_required
def logout():
    session.pop('username', None)
    logout_user()
    return redirect(url_for('index'))

@app.route('/regole', methods=['GET', 'POST'])

def rules():
    return render_template('rules.html')

@app.route('/gioco-computer', methods=['GET', 'POST'])

def game():
    return render_template('gameoffline.html')

@app.route('/gioco-online', methods=['GET', 'POST'])

def gameonline():
    return render_template('gameonline.html')

@app.route('/lobby/', methods=['GET', 'POST'])

@login_required
def lobby():
    
    # select mode from url query string (create or enter)
    mode = request.args.get('mode')
    code = ''
    msg = ''

    if mode == 'create':

        # check if user has already created a lobby (if so, doesn't change the code)
        if Lobby.query.filter_by(player1=current_user.username).first() is not None:
            msg='Sei entrato in una lobby'
            code = Lobby.query.filter_by(player1=current_user.username).first().codice

        # create a new lobby
        else:
            msg='Hai creato una lobby'
            codeArray = random.choices('0123456789', k=6)                               #array of 6 random numbers
            code = ''.join(codeArray)                                                   #join the array to create a string
            new_lobby = Lobby(codice=code, player1=current_user.username)               #prepare the new lobby
            db.session.add(new_lobby)
            db.session.commit()

        # return the lobby page with the code, lobby creator and a message for the user 
        return render_template('lobby.html', code=code, creator=current_user.username, msg=msg)
    
    elif mode == 'enter':
        msg='Sei entrato in una lobby'
        # check if user has already entered a lobby (if so, doesn't change the code)
        if EntraLobby.query.filter_by(user_id=current_user.username).first() is not None:
            lobby_id = EntraLobby.query.filter_by(user_id=current_user.username).first().lobby_id
            code = Lobby.query.filter_by(id=lobby_id).first().codice
            return render_template('lobby.html', code=code, creator=Lobby.query.filter_by(id=lobby_id).first().player1, msg=msg)
        
        # enter a lobby with the code provided by the user
        code = request.form['code']
        isCorrectLobby = Lobby.query.filter_by(codice = code).first()
        
        # if the lobby exists, add the user to the lobby
        if isCorrectLobby:
            enter = EntraLobby(user_id=current_user.username, lobby_id=isCorrectLobby.id)
            db.session.add(enter)
            db.session.commit()
            return render_template('lobby.html', code=code, msg=msg, creator=isCorrectLobby.player1)
        
        # if the lobby doesn't exist, return the index page with an error message
        else:
            return render_template('index.html', code=code, msg='Nessuna lobby disponibile')

    return render_template('index.html', msg='Errore')

@app.route('/isConnected')
def isConnected():
    isCreator = False
    if current_user.is_authenticated:
        lobby = Lobby.query.filter_by(player1=current_user.username).first()
        if lobby is None:
            return jsonify({'connected': False, 'creator': isCreator})
        if lobby.player1 == current_user.username:
                isCreator = True
        enterLobby = EntraLobby.query.filter_by(lobby_id=lobby.id).first()
        if lobby is not None and enterLobby is not None:
            return jsonify({'connected': True, 'username': enterLobby.user_id, 'creator': isCreator})
        else:
            return jsonify({'connected': False, 'creator': isCreator})
    return jsonify({'connected': False})

@app.route('/game-online-code', methods=['GET', 'POST'])
def gameonlinecode():
    return render_template('gameonlinecode.html')

#funzioni per dialogo client-server
#creo funzione per il dialogo con il client 
@app.route('/creaStanza', methods=['GET', 'POST'])
def create_room():
    #for p in partite:
    #    if p.player_ingame(session['username']):
    #        jsonResp = {'err': 'Sei già in una stanza'}
    #        return jsonify(jsonResp)
    #
    p=Partita()
    code = p.creaStanza(session['username'])
    jsonResp = {'game_code': code}
    partite.append(p)
    return jsonify(jsonResp)

@app.route('/entraStanza', methods=['GET', 'POST'])
def enter_room():

    for p in partite:
        if p.player_ingame(session['username']):
            jsonResp = {'err': 'Sei già in una stanza'}
            return jsonify(jsonResp)
    
    if request.method == 'POST':
        game_code = request.get_json()
        print(game_code)
        
    if 'pin' in game_code:
        pin = game_code['pin']
        for p in partite:
            if p.entraStanza(session['username'], pin):
                jsonResp = {'u': p.player[0]}
                return jsonify(jsonResp)
    print(game_code)
    jsonResp = {'err': 'Nessuna stanza con questo codice'}
    return jsonify(jsonResp)

@app.route('/ottieniAdm', methods=['GET', 'POST'])
def get_adm():
    for p in partite:
        if p.player_ingame(session['username']):
            jsonResp = {'u': p.get_adm()}
            return jsonify(jsonResp)
    jsonResp = {'err': 'Non sei in una stanza'}
    return jsonify(jsonResp)

@app.route('/uscitaStanza', methods=['GET', 'POST'])
def exit_room():
    for p in partite:
        if p.player_ingame(session['username']):
            if p.esci_stanza(session['username']):
                partite.remove(p)
                jsonResp = {'err': 'Stanza chiusa'}
                return jsonify(jsonResp)
            else:
                jsonResp = {'msg': 'Uscito dalla stanza'}
                return jsonify(jsonResp)
    jsonResp = {'err': 'Non sei in una stanza'}
    return jsonify(jsonResp)

@app.route('/controlloStanza', methods=['GET', 'POST'])
def check_room():
    for p in partite:
        if p.player_ingame(session['username']):
            if p.game_check():
                jsonResp = {'msg': 'Stanza piena'}
                return jsonify(jsonResp)
            else:
                jsonResp = {'msg': 'Termina la partita'}
                return jsonify(jsonResp)
    jsonResp = {'err': 'Qualcosa è andato storto'}
    return jsonify(jsonResp)

if __name__ == "__main__":
    app.run(debug=True)