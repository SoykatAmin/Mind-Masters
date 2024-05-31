// Variabile che indice l'username del vincitore
var winnerUsername = "";
// Tempo rimasto nel formato MM:SS
var timeFormat;
var formattedTime;
var modal_att

var end_timer = 1060;



document.addEventListener("DOMContentLoaded", function(){

    //--------------------------------Alert online players--------------------------------//
    const links1 = document.getElementById('regolie_link');
    const links2 = document.getElementById('home_link');
    const links3 = document.getElementById('logout_link');

    links1.addEventListener('click', esclink);
    links2.addEventListener('click', esclink);
    links3.addEventListener('click', esclink);
});

var uscendo_link=false;

window.onbeforeunload = function(event){
    if(uscendo_link){
        uscendo_link=false;
        event.preventDefault();
        event.returnValue = "Se abbandoni la partita perderai";
        return "Se abbandoni la partita perderai";
    }
    
}


function esclink(){
    uscendo_link=true;
}

function confrontaCodiciPVP() {
    // Variabili per tenere traccia delle posizioni corrette e errate
    var posizioneCorretta = 0;
    var player_code = [];
    
    var color_code=getCode(x);
    player_code = stringToCodice(color_code);
    if(posizioneCorretta==-1){
        return;//non fa nulla se il codice non è valido 
    }
    /* Insert move to database */
    stringCode = player_code.join("");
    var row = x-1;
    $.ajax({
        type: 'POST',
        url: '/registerMove',
        data: JSON.stringify({gameID: gameID, code: stringCode, row: row}),
        contentType: 'application/json',
        success: function(data) {
        }
    });

    posizioneCorretta=suggestion_aux(x);
    var status = getStatus(posizioneCorretta);
    
    // Verifica se il giocatore ha vinto o perso e passa al prossimo turno
    if (status === 1) {
        end_game = true;

        document.getElementById("md_body_att").innerHTML = "Attendi che l'altro giocatore finisca la partita per sapere se hai vinto";
        if(modal_err!=null){
            modal_err.hide();
        }
        
        // Inserisce nel database l'ora di fine del giocatore
        // TODO: In realtà controlla chi ha terminato prima e non guarda il tempo rimasto. Da cambiare
        endGame();
        
        modal_att = new bootstrap.Modal('#md_attesa');
        modal_att.show();
        // Controlla ogni 500ms se l'avversario ha finito. Se ha finito mostra il risultato
        var endingInterval = setInterval(function() {
            
            $.ajax({
                type: 'POST',
                url: '/hasEnded',
                data: JSON.stringify({gameID: gameID}),
                contentType: 'application/json',
                success: function(data) {
                    winnerUsername = data.winner;
                    var ended = data.ended;
                    if (ended) {
                        clearInterval(endingInterval);
                        console.log(winnerUsername);
                        if (username == winnerUsername) {
                            win = true;
                            if(x == 1) {
                                terminaPartita("Che gigachad! Hai vinto al primo turno!");
                            } else {
                                terminaPartita("Complimenti! Hai vinto in " + x + " turni!");
                            }
                        } else if(winnerUsername == "draw") {
                            draw = true;
                            terminaPartita("Pareggio.");
                        }else{
                            terminaPartita("Mi dispiace, hai perso. Il vincitore è " + winnerUsername);
                        }
                    }
                }
            });
        }, 500);

    } else if (status == 2) {
        end_game = true;
        var str = `<span style="text-shadow: 0px 0px 5px black;"> <span style="color:${colors[secret_code[0]]}"><b>${colori[secret_code[0]]}</b></span>,<span style="color:${colors[secret_code[1]]}"><b>${colori[secret_code[1]]}</b></span>,<span style="color:${colors[secret_code[2]]}"><b>${colori[secret_code[2]]}</b></span>,<span style="color:${colors[secret_code[3]]}"><b>${colori[secret_code[3]]}</b></span></span>`;
        // Chiamata alla funzione terminaPartita
        endGame();
        terminaPartita("Mi dispiace, hai perso. Il codice era " + str);
    } else {
        var ball_selected = document.getElementById(`ball-${x}-${y}`);
        ball_selected.classList.remove("ball-selected");
        x++;
        scrollWin();
        Colorful = [0, 0, 0, 0];
        
        avviaEventi();
    }
}

function startPVP() {
    
    game_started = true;
    var codiceArray = codice.split('').map(Number);
    secret_code = codiceArray;
    Colorful=[0,0,0,0];
    end_game = false;
    game_timerPVP();
}

function getTime() {
    var minutes = Math.floor(timeleft / 60);
    var seconds = timeleft % 60;
    // Formatta il tempo rimasto come MM:SS
    formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timeFormat = moment().minute(30).second(45);
    timeFormat.year(2000);
    timeFormat.month(0);
    timeFormat.day(0);
    timeFormat.hour(0);
    timeFormat.minute(minutes);
    timeFormat.second(seconds);
    timeFormat.millisecond(0);
    console.log(timeFormat.format("YYYY-MM-DD HH:mm:ss:SSSSSS"));
}

function game_timerPVP() {
    // Imposta il tempo rimasto in base alla modalità di debug
    if (debug) {
        timeleft = 240; // 4 minuti in secondi
    }
    getTime();
    // Avvia un timer che si ripete ogni secondo
    var gameTimer = setInterval(() => {
        // Verifica se il tempo è scaduto
        if (timeleft <= 0) {
            clearInterval(gameTimer);
            localStorage.setItem("timeleft", 0);
            // Chiama la funzione terminaPartita per indicare la fine del gioco
            end_game = true;
            //per il multiplayer
            if(typeof gameID !== 'undefined' && gameID !== null){
                endGame();
            }
            document.getElementById("countdown").innerHTML = "Tempo scaduto";
            var str = `<span style="text-shadow: 0px 0px 5px black;"> <span style="color:${colors[secret_code[0]]}"><b>${colori[secret_code[0]]}</b></span>,<span style="color:${colors[secret_code[1]]}"><b>${colori[secret_code[1]]}</b></span>,<span style="color:${colors[secret_code[2]]}"><b>${colori[secret_code[2]]}</b></span>,<span style="color:${colors[secret_code[3]]}"><b>${colori[secret_code[3]]}</b></span></span>`;
            terminaPartita("Tempo scaduto. Il codice era " + str);
        } else {
            // Calcola i minuti e i secondi rimanenti
            localStorage.setItem("timeleft", timeleft);
            getTime();
            // Aggiorna l'elemento HTML con il tempo rimasto
            document.getElementById("countdown").innerHTML = "Tempo rimasto " + formattedTime;
        }
        // Decrementa il tempo rimasto di un secondo
        timeleft--;
        // Verifica se il gioco è terminato e interrompe il timer
        if (end_game) {
            clearInterval(gameTimer);
        }
    }, 1000);
    localStorage.removeItem('end_timer');
    populateMoves();
}

/*
For online games, it retrieves the moves from the database and displays them on the screen.
*/

function populateMoves() {
    var url = window.location.href;
    
    if(url.includes("online-game")){
        $.ajax({
            type: 'POST',
            url: '/getMoves',
            data: JSON.stringify({gameID: gameID}),
            contentType: 'application/json',
            success: function(data) {
                x = 1;
                var length = data.length;
                for (let i = 0; i < length; i++) {
                    console.log(data[i]);
                }
                for (let i = 0; i < length; i++) {
                    var row = data[i].row;
                    var code = data[i].code;
                    var codeArray = code.split('').map(Number);

                    for (let j = 0; j < 4; j++) {
                        var codelm = document.getElementById(`ball-${row+1}-${j + 1}`);
                        codelm.style.backgroundColor = colors[codeArray[j]];
                    
                        if(localStorage.getItem('accessibility')==='true'){
                            var textlm = document.getElementById(`text-ball-${row+1}-${j + 1}`);
                            textlm.innerHTML = colori.indexOf(colori[codeArray[j]]);
                        }
                    }
                    confrontaCodiciPVP();
                }
                avviaEventi();
            }
        });
        var end_timerTEMP=localStorage.getItem("end_timer")
        if(end_timerTEMP!=null){
            end_timer = parseInt(end_timerTEMP);
        }
        var timer_str=localStorage.getItem("timeleft");
        if(timer_str!=null){
            timeleft=parseInt(timer_str);
        }
    }
};

// Inserisce il tempo di fine nel database
function endGame() {
    format = timeFormat.format("YYYY-MM-DD HH:mm:ss");
    $.ajax({
        type: 'POST',
        url: '/endGame',
        data: JSON.stringify({gameID: gameID, winner: username, time: format}),
        contentType: 'application/json',
        success: function(data) {
        }
    });
}


function endTimer() {
    var endTimer = setInterval(() => {
        // Verifica se il tempo è scaduto
        if (end_timer <= 0) {
            clearInterval(endTimer);
            localStorage.setItem("end_timer", 0);
            $.ajax({
                type: 'POST',
                url: '/forceEndGame',
                data: JSON.stringify({gameID: gameID}),
                contentType: 'application/json',
                success: function(data) {
                }
            });
        } else {
            // Calcola i minuti e i secondi rimanenti
            localStorage.setItem("end_timer", end_timer);
            
            var minut = Math.floor(end_timer / 60);
            var secon = end_timer % 60;
            // Formatta il tempo rimasto come MM:SS
            var formattedT = `${minut.toString().padStart(2, '0')}:${secon.toString().padStart(2, '0')}`;
            
            console.log(formattedT);
        }
        // Decrementa il tempo rimasto di un secondo
        end_timer--;
    }, 1000);
}