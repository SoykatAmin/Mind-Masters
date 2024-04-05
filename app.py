from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# DATABASE CONFIGURATION

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///MindMasters.db'
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    statistics = db.relationship("Statistic", backref="user", uselist=False)  # One-to-One with Statistic

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
    return render_template('auth/register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    return render_template('auth/login.html')

@app.route('/regole', methods=['GET', 'POST'])
def rules():
    return render_template('rules.html')

if __name__ == "__main__":
    app.run(debug=True)

