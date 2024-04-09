import os
from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
import bcrypt 

basedir = os.path.abspath(os.path.dirname(__file__))

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

@app.route('/gioco', methods=['GET', 'POST'])

def game():
    return render_template('game.html')

if __name__ == "__main__":
    app.run(debug=True)