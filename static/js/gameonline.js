// Variabile che indice l'username del vincitore
var winnerUsername = "";
// Tempo rimasto nel formato MM:SS
var timeFormat;
var formattedTime;
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
        // Inserisce nel database l'ora di fine del giocatore
        // TODO: In realtà controlla chi ha terminato prima e non guarda il tempo rimasto. Da cambiare
        endGame();
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
            console.log("Tempo scaduto");
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
            console.log("Tempo rimasto: " + timeleft);
            console.log("Tempo rimasto: ");
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
                    }
                    confrontaCodiciPVP();
                }
                avviaEventi();
            }
        });
        var timer_str=localStorage.getItem("timeleft");
        if(timer_str!=null){
            timeleft=parseInt(timer_str);
        }
    }
};

// Inserisce il tempo di fine nel database se esce dalla pagina
window.onbeforeunload = function() {
    endGame();
}

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