from flask import Flask     
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from app.config import Config
from flask_migrate import Migrate

db = SQLAlchemy()

login_manager = LoginManager()

def create_app(config_class=Config):
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    # Carica la configurazione
    app.config.from_object(config_class)

    # Inizializza le estensioni
    db.init_app(app)
    migrate = Migrate(app, db)
    login_manager.init_app(app)
    login_manager.login_view = 'login'

    # Registra le blueprint
    from app.routes import main_bp
    app.register_blueprint(main_bp)

    # Crea le tabelle nel database (se non esistono)
    with app.app_context():
        db.create_all()

    return app
