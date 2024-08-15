from app import db
from flask_login import UserMixin

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
