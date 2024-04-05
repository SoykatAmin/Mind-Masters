from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_bootstrap import Bootstrap

app = Flask(__name__)
bootstrap = Bootstrap(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///MindMasters.db'
db = SQLAlchemy(app)

class MindMasters(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    message = db.Column(db.String(500), nullable=False)

    def __repr__(self):
        return '<MindMasters %r>' % self.name

@app.route('/', methods=['GET', 'POST'])

def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)

