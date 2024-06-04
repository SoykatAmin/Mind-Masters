var frasi=["Senza matematica; ma dove siamo? - Fabrizio D'Amore",
"SI È MESSO A FARE SELECTION SORTTT!!! - Maurizio Lenzerini",
"Il sito si trova alla versione: 1982783",
"Sapevi che i numeri da 1 a 8 sulla tastiera ti permettono di inserire i colori?",
"Con il tasto Invio puoi confermare il codice inserito",
"Prova a usare il tasto Backspace per eliminare un colore",
"Usa le frecce per spostare la cella selezionata",
"Solo un giocatore su dieci riesce a vincere in modalità difficile",
"Per vincere basta ragionare",
"Non scoraggiarti se non riesci subito, la pratica ti rende un maestro del Mastermind!",
"Un triangolo nero indica che il colore è giusto nella posizione giusta",
"Un cerchio nero indica che il colore è giusto ma è nella posizione sbagliata",
"Un quadrato bianco indica che un colore non è presente nel codice segreto",
"Ricorda: vince chi indovina il codice con meno tentativi e in minor tempo"];
var frasiUsate = [];
var ultimaFrase = "";

function rotazione(){
    randomFrasi();
    setTimeout(rotazione, 6999);
}

function randomFrasi(){
    
    var frasiDisponibili = frasi.filter(function(frase) {
        return !frasiUsate.includes(frase);
    });
    
    if (frasiDisponibili.length === 0) {
        frasiUsate = [];
        frasiDisponibili = frasi;
        //rimuovi dall array la frase usata per ultima 
        frasiDisponibili = frasiDisponibili.filter(function(frase) {
            return frase !== ultimaFrase;
        });

        
    }
    if(frasiDisponibili.length === 1 ){
        ultimaFrase = frasiDisponibili[0];
    }
    
    var random = Math.floor(Math.random() * frasiDisponibili.length);
    var frase = frasiDisponibili[random];
    frasiUsate.push(frase);
   
    document.getElementById("frasi").innerHTML = frase;
}

function loadPage(){
    $(document).ready(function() {
        timeleft = 5000;
        var idGame = null;
        var timeSpeed = 800;    // Tempo di aggiornamento in millisecondi, non diminuire troppo altrimenti si mandano troppe richieste al server aumentando il numero di partite create. Manda tutto in crash
        
        setInterval(function() {
            $.get('/isConnected', function(data) {
                // Accesso ai dati JSON restituiti
                var connected = data.connected;             // true if another player is connected
                var secondPlayer = data.username;           // username of the connected player
                var creator = data.creator;                 // true if the user is the creator of the game
                var disconnect = data.disconnect;           // true if the creator has disconnected
                
                $.get('/isReplay', function(data) {
                    if (data.replay1) {
                        replay1 = data.replay1;
                    }
                    if (data.replay2) {
                        replay2 = data.replay2;
                    }
                    // console.log(data.disconnect);
                    if(data.disconnect){
                        console.log("disconnesso");
                        disconnect = data.disconnect;
                    
                        window.location.href = '/leaveLobby';
                    }
                });
                if (disconnect) {
                    window.location.href = '/leaveLobby';
                }
                if (creator) {
                    $('#players').html('In attesa di altri giocatori');
                    $('#timer').html('');
                }else{
                    $('#players').html('');
                }
                // Utilizzo dei dati
                if (connected & replay1 & replay2) {
                    if(creator){
                        $('#players').html('Utente connesso: ' + secondPlayer);
                    }
                    $('#timer').html('La partita inizia tra ' + Math.ceil(timeleft/1000));
                    if (timeleft>0) {
                        timeleft = timeleft - timeSpeed;
                    }else{
                        timeleft = 0;
                        // crea la partita e reindirizza alla pagina di gioco. Aggiorna quindi il database. Il creatore della lobby è quello che crea la partita. L'altro giocatore
                        // controlla se il primo ha creato la partita. Se l'ha creata vanno entrambi alla pagina di gioco.
                        if(creator){
                            $.ajax({
                                url: '/create-game',
                                method: 'POST',
                                contentType: 'application/json',
                                data: JSON.stringify({player2: secondPlayer}), // Dati da passare alla funzione
                                success: function(response) {
                                    // Ricevi il risultato e visualizzalo nella pagina
                                    console.log(response);
                                    idGame = response.id;
                                    // Costruisci manualmente l'URL con i parametri
                                    window.location.href = "/game-online-code?id="+idGame;
                                }
                            });
                        }else{
                            setInterval(function() {
                                $.ajax({
                                    url: '/isCreated',
                                    method: 'POST',
                                    contentType: 'application/json',
                                    data: {}, // Dati da passare alla funzione
                                    success: function(response) {
                                        // Ricevi il risultato e visualizzalo nella pagina
                                        var created = response.created;
                                        console.log(created);
                                        if(created){
                                            console.log(response);
                                            window.location.href = '/game-online-code?id=' + response.id;
                                        }
                                    }
                                });
                            }, timeSpeed);
                        }
                    }
                }
            });
        }, timeSpeed);
    });
}
