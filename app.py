import os
from flask import Flask, render_template, request, redirect, url_for, session,jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt 
import random


#classe per connessione partita
class Partita:
    def __init__(self):
        self.player=[]#dentro player ci sono gli username dei giocatori
        self.game_code=random.randint(1000,9999)#codice partita per collegarsi
        self.vincitore=None
        self.mosse=[]
        self.tempi=[]

    def creaStanza(self, player):
        if len(self.player)==0:
            self.player.append(player)
            return self.game_code
        else:
            return False
    
    def entraStanza(self, player, code):
        if len(self.player)==1 and code==str(self.game_code):
            self.player.append(player)
            return True
        else:
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
                    self.vincitore=None
        else:
            return False
        return self.vincitore

    def player_end(self, mossa, tempo, player):
        index = self.player.index(player)
        self.mosse.insert(index, mossa)
        self.tempi.insert(index, tempo)
        return self.fine_gioco()
        
    def player_ingame(self, player):
        return player in self.player





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

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    statistics = db.relationship("Statistic", backref="user", uselist=False)  # One-to-One with Statistic

    def __repr__(self):
        return '<User %r>' % self.username

class Game(db.Model):
    __tablename__ = 'games'

    game_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    opponent_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    mode = db.Column(db.String(50), nullable=False)  # 'online' or 'offline'
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    winner_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=True)
    guesses = db.Column(db.JSON, nullable=False)

class Statistic(db.Model):
    __tablename__ = 'statistics'

    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), primary_key=True)
    games_played = db.Column(db.Integer, nullable=False, default=0)
    wins = db.Column(db.Integer, nullable=False, default=0)
    losses = db.Column(db.Integer, nullable=False, default=0)
    first_try_wins = db.Column(db.Integer, nullable=False, default=0)

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

#funzioni per dialogo client-server
#creo funzione per il dialogo con il client 
@app.route('/creaStanza', methods=['GET', 'POST'])
def create_room():
    p=Partita()
    msg=p.creaStanza(session['username'])
    if msg==False:
        jsonResp = {'msg': 'Stanza già piena'}
        return jsonify(jsonResp)
    print(msg)
    jsonResp = {'msg': session['username'], 'game_code': msg}
    partite.append(p)
    return jsonify(jsonResp)

@app.route('/entraStanza', methods=['GET', 'POST'])
def enter_room():
    
    if request.method == 'POST':
        game_code = request.get_json()
        print(game_code)
        
    if 'pin' in game_code:
        pin = game_code['pin']
        for p in partite:
            if p.entraStanza(session['username'], pin):
                jsonResp = {'u1': p.player[0], 'u2': p.player[1]}
                return jsonify(jsonResp)
    print(game_code)
    
    return jsonify("nessuna stanza con questo codice")


if __name__ == "__main__":
    app.run(debug=True)