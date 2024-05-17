# Mind Masters

Mind Masters è una riproduzione del gioco Mastermind sviluppata utilizzando Flask. Questo progetto utilizza Flask-SQLAlchemy, Flask-Bcrypt e Flask-Login per la gestione del database, la crittografia delle password e l'autenticazione degli utenti.

## Prerequisiti

- Python 3.6 o superiore
- Git

## Istruzioni per l'Avvio

1. **Clonare il Repository**

   Clona il repository GitHub sul tuo computer. Apri il terminale e usa il seguente comando:

   ```bash
   git clone https://github.com/SoykatAmin/Mind-Masters.git
   cd mind-masters
   ```
   Come alternativa puoi scaricare il file ZIP.

2. **Creare e Attivare un Ambiente Virtuale**

    È buona pratica usare un ambiente virtuale per gestire le dipendenze del progetto. Vai nella directory del progetto e crea un ambiente virtuale:
    ```bash
    python -m venv .venv
    ```
    Attiva l'ambiente virtuale:
    
    - Su macOS/Linux:
    ```bash
    .venv/bin/activate
    ```
    - Su Windows:
    ```bash
    .venv\Scripts\activate
    ```

3. **Installa le dipendenze**

    Con l'ambiente virtuale attivato, installa le seguenti dipendenze:
    
    - Flask:
    ```bash
    pip install Flask
    ```

    - Flask-SQLAlchemy:
    ```bash
    pip install -U Flask-SQLAlchemy
    ```

    - Flask-Bcrypt:
    ```bash
    pip install flask-bcrypt
    ```

    - Flask-Login:
    ```bash
    pip install flask-login
    ```

4. **Avvia l'applicazione**

    ```bash
    flask run
    ```

Speriamo che tu ti diverta a giocare a Mind Masters tanto quanto ci siamo divertiti a svilupparlo!

