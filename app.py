import os
from flask import Flask, render_template, request, redirect, url_for, session,jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt 
import random


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



# DATABASE CONFIGURATION

app.config['SQLALCHEMY_DATABASE_URI'] =\
        'sqlite:///' + os.path.join(basedir, 'database.db')
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'

    username = db.Column(db.String(255), primary_key=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)

    statistics = db.relationship("Statistic", backref="user", uselist=False)  # One-to-One with Statistic

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
    codice1 = db.Column(db.Integer, nullable=True)
    codice2 = db.Column(db.Integer, nullable=True)
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

# Create tables in database (if not exist)
with app.app_context():
    db.create_all()

#funzioni per la chiamata delle pagini html
@app.route('/', methods=['GET', 'POST'])

def index():
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
        print(user)

        if user:
            session['username'] = username # Store username in session
            if user.password == bcrypt.hashpw(password.encode('utf-8'), user.password):
                return redirect(url_for('index'))
            else:
                msg = 'Incorrect password'
        else:
            msg = 'Username does not exist'

    return render_template('auth/login.html', msg=msg)

@app.route('/logout')

def logout():
    session.pop('username', None)
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

@app.route('/lobby', methods=['GET', 'POST'])

def lobby():
    return render_template('lobby.html')

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