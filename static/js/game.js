
// Variabile per tenere traccia del turno corrente e che righa modificare della tavola da gioco
var x = 1;
//variabile per tenere traccia della colonna
var y = 1;
// Array per tenere traccia delle colonne selezionate
var Colorful = [0, 0, 0, 0];
// Array per memorizzare il codice segreto
var secret_code = [];
// Flag per abilitare/disabilitare la modalità di debug imposta il tempo da 15m --> 2m e imposta il codice fisso a rosso,rosso,verde,blu
var debug = true;
// Array di nomi dei colori, dove l'indice corrisponde al valore del colore nel codice
var colors = ["white", "red", "darkgreen", "darkblue", "deeppink", "yellow","purple","aqua","sienna"];
// uguale a sopra pero in italiano pr stamparli a schermo
var colori = ["Bianco", "Rosso", "Verde", "Blu", "Rosa", "Giallo", "Viola", "Celeste", "Marrone"];
// Flag per indicare se il gioco è terminato
var end_game = false;
// Tempo rimasto in secondi per il timer del gioco
var timeleft = 900; // 15 minuti
// Tempo rimasto nel formato MM:SS
var timeFormat;
// Flag per indicare se il giocatore ha vinto il gioco
var win = false;
// Flag per indicare se il gioco è finito in pareggio
var draw = false;


var modal_aperto=false//flag per vcedere se c'è un modal aperto

var game_started = false;
//console.log(localStorage.getItem("acc"))
var accessibilita=localStorage.getItem('accessibility')
var modal_err;
//variablie che tiene traccia della difficoltà del gioco(solo per la modalità PVE), sono tre F (facile), N (normale), D (difficile)
var difficoltà_PVE;

function getStatus(posizioneCorretta){
    if(posizioneCorretta==4){
        return 1;   //vittoria
    }else if(x==8){
        return 2;   //sconfitta
    }else{
        return 3;   //partita in corso
    }
}


/**
 * Calcola il numero di posizioni corrette e posizioni errate nel codice del giocatore rispetto al codice segreto.
 * 
 * @param {number} posizioneCorretta - Il numero di posizioni corrette nel codice del giocatore.
 * @param {number} posizioneErrata - Il numero di posizioni errate nel codice del giocatore.
 * @param {Array} player_code - Il codice inserito dal giocatore.
 */
function getCode(x){
    var color_code=[];
    for (let i = 0; i < 4; i++) {
        var codelm = document.getElementById(`ball-${x}-${i + 1}`);
        if(codelm.style.backgroundColor==""){
            codelm.style.backgroundColor="white";
        }
        //controlla se sono stati inseriti tutti i colori o ci sono caselle vuote
        if (codelm.style.backgroundColor=="white" && difficoltà_PVE!='D') {    
            document.getElementById("md_err_body").innerHTML = "Hai lasciato delle caselle vuote, inserisci tutti i colori prima di continuare!";
            modal_err = new bootstrap.Modal('#md_err');
            modal_err.show();
            modal_aperto=true;
            return -1;
        } else if(color_code.includes(codelm.style.backgroundColor)&& difficoltà_PVE=='F'){
            document.getElementById("md_err_body").innerHTML = "Hai inserito più volte lo stesso colore, inserisci i colori una sola volta prima di continuare!";
            modal_err = new bootstrap.Modal('#md_err');
            modal_err.show();
            modal_aperto=true;
            return -1;
        }else {
            color_code.push(codelm.style.backgroundColor);
        }
    }
    console.log(color_code);
    return color_code;
}

function suggestion_aux(ex) {
    var postrov = [0, 0, 0, 0];
    var sbagliato = 0;
    posizioneCorretta = 0;
    posizioneErrata = 0;

    var color_code = getCode(ex);
    if(color_code==-1){
        return -1;
    }
    player_code = stringToCodice(color_code);
    console.log("Codice inserito " + player_code);
    // Confronta i valori inseriti dal giocatore con il codice segreto
    const copysc = [...secret_code]; // Crea una copia del codice segreto per evitare di modificarlo
    for (let i = 0; i < player_code.length; i++) {
        if (player_code[i] === copysc[i]) {
            postrov[i] = 1;
            posizioneCorretta++;
            copysc[i] = null; // Segna l'elemento come utilizzato per evitare di contarli come errori nuovamente
        }
    }
    for (let i = 0; i < player_code.length; i++) {
        if (postrov[i] === 0) {
            if (copysc.includes(player_code[i])) {
                posizioneErrata++;
                const index = copysc.indexOf(player_code[i]);
                copysc[index] = null; // Segna l'elemento come utilizzato per evitare di contarli come errori nuovamente
            } else {
                sbagliato++;
            }
        }
    }
    suggerimenti(posizioneCorretta, posizioneErrata, ex);
    return posizioneCorretta;
}

/**
 * funzione per confrantare il codice inseriro dal utente e il codice segrato generato
legge il colore di sfondo dagli oggetti con id="ball-x-y" dove x sono la righa e y la colonna.
Se il codice è corretto iposta win a true e chiama la funzione terminaPartita() con il messaggio da stampare a schermo
in caso di codice non corretto chiama la funzione suggerimeti() ed incrementa la x nel caso fosse l'ultimo tentativo
x=8 chiama la funzione terminaPartita()*/
function confrontaCodici() {
    // Variabili per tenere traccia delle posizioni corrette e errate
    var posizioneCorretta = 0;
    // Variabile per tenere traccia del numero di colori corretti ma in posizione errata
    posizioneCorretta=suggestion_aux(x);
    if(posizioneCorretta==-1){
        return;//non fa nulla se il codice non è valido 
    }
    // Verifica se il giocatore ha vinto o perso e passa al prossimo turno
    if (posizioneCorretta === 4) {
        //suggerimenti(posizioneCorretta, posizioneErrata);
        // Chiamata alla funzione terminaPartita
        win = true;
        if (x == 1) {
            terminaPartita("Che gigachad! Hai vinto al primo turno!");
        } else {
            terminaPartita("Complimenti! Hai vinto in " + x + " turni!");
        }
    } else if (x == 8) {
        //suggerimenti(posizioneCorretta, posizioneErrata);
        var str = `<span style="text-shadow: 0px 0px 5px black;"> <span style="color:${colors[secret_code[0]]}"><b>${colori[secret_code[0]]}</b></span>,<span style="color:${colors[secret_code[1]]}"><b>${colori[secret_code[1]]}</b></span>,<span style="color:${colors[secret_code[2]]}"><b>${colori[secret_code[2]]}</b></span>,<span style="color:${colors[secret_code[3]]}"><b>${colori[secret_code[3]]}</b></span></span>`;
        // Chiamata alla funzione terminaPartita
        terminaPartita("Mi dispiace, hai perso. Il codice era " + str);
    } else {
        var ball_selected = document.getElementById(`ball-${x}-${y}`);
        ball_selected.classList.remove("ball-selected");
        x++;
        scrollWin();
        //suggerimenti(posizioneCorretta, posizioneErrata);
        Colorful = [0, 0, 0, 0];
    
        avviaEventi();
    }
}

/**
 * Funzione per inserire i suggerimenti
La funzione prende come argomenti il numero di colori corretti ma in posizione errata (correct) e 
il numero di coconsole.log(json);lori corretti in posizione corretta (color)
La funzione genera casualmente un array (occ) di lunghezza 4, dove ogni elemento rappresenta un colore
nella sequenza di suggerimenti
Se un colore è corretto ma in posizione errata, l'elemento corrispondente in occ viene impostato a 1
Se un colore è corretto e in posizione corretta, l'elemento corrispondente in occ viene impostato a 2
Gli altri elementi in occ rimangono a 0
Successivamente, la funzione applica gli stili corretti agli elementi HTML dei suggerimenti in base ai valori
in occ*/
function suggerimenti(correct, color, x) {
    var occ = [0, 0, 0, 0];
    if(debug){
        console.log("Correct: " + correct + " Color: " + color)
    }
    
    // Riempimento dell'array occ con 1 per ogni colore corretto ma in posizione errata e 2 per ogni colore corretto e in posizione corretta
    //viene riempito in maniera casuale per non suggerire al giocatore a quale colore si rifrisce il suggerimento

    // Applicazione degli stili corretti agli elementi HTML dei suggerimenti in base ai valori in occ
    //un triangolo per i colori giusti in posizione corretta
    //un cerchio per colore giusto in posizione sbagliata 
    //nasconde il quadrato quando ci sono delle posizione sbagliate

    for (let i = 0; i < correct; i++) {
        var r = Math.floor(Math.random() * 4);
        if (occ[r] === 0) {
            occ[r] = 2;
            var suggestion = document.getElementById(`suggestion-${x}-${r+1}`);
            suggestion.style.backgroundColor = "black";
            suggestion.style.clipPath = "polygon(50% 0%, 100% 100%, 0% 100%)";
            suggestion.style.borderBottom = "none";
        } else {
            i--;
        }
    }
    for (let i = 0; i < color; i++) {
        var r = Math.floor(Math.random() * 4);
        if (occ[r] === 0) {
            occ[r] = 1;
            var suggestion = document.getElementById(`suggestion-${x}-${r+1}`);
            suggestion.style.backgroundColor = "black";
            suggestion.style.borderRadius = "50%";
            suggestion.style.border = "1px solid black";
        } else {
            i--;
        }
    }
}

/**
 * Avvia una partita Giocatore vs Ambiente (PVE) o vs Online(PVP).
 * Se la modalità di debug è abilitata, imposta il codice segreto a [1, 1, 2, 3].
 * Altrimenti, genera un codice segreto casuale di 4 numeri compresi tra 1 e 8.
 * Inizializza l'array Colorful con zeri, imposta x a 1 e imposta end_game a false.
 * Chiama la funzione game_timer.
 */
function startPVE(dif) {
    game_started = true;
    difficoltà_PVE=dif;
    
    if (debug) {
        secret_code = [1,2,3,4];//il codiece di debug è red red green blue
    }else{
        if(dif=="F"){
            createEasyCode();
        }else if(dif=="N"){
            createNormalCode();
        }else if(dif=="D"){
            createHardCode();
        }
    }
    Colorful=[0,0,0,0];
    end_game = false;
    game_timer();
    avviaEventi();
    keyButton();
}



/**
 * funzione per creare un codice segreto casuale senza ripetizioni (difficoltà facile)
 */
function createEasyCode() {
   
    var i = 0;
    while (i < 4) {
        var color = Math.floor(Math.random() * 8) + 1;
        if(!secret_code.includes(color)){
            secret_code.push(color);
            i++;
        }
    }
    return secret_code;
}

/**
 * funzione per creare un codice segreto casuale con ripetizioni (difficoltà normale)
 */
function createNormalCode() {
    for (let i = 0; i < 4; i++) {
        secret_code.push(Math.floor(Math.random() * 8)+1);
    }
    return secret_code;
}
/**
 * Funzione per creare un codice segreto casuale con ripetizioni e spazzi vuoti (difficoltà difficile)
 */
function createHardCode() {
    for (let i = 0; i < 4; i++) {
        secret_code.push(Math.floor(Math.random() * 9));
    }
    console.log(secret_code);
    return secret_code;
}
/**Avvia un timer per il gioco.
 Imposta il tempo rimasto in base alla modalità di debug.
 Avvia un timer che si ripete ogni secondo.
 Se il tempo scade, chiama la funzione terminaPartita per indicare la fine del gioco.
 Aggiorna l'elemento HTML con il tempo rimasto.*/
function game_timer() {
    // Imposta il tempo rimasto in base alla modalità di debug
    if (debug) {
        timeleft = 240; // 4 minuti in secondi
    }
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
            
            document.getElementById("countdown").innerHTML = "Tempo scaduto";
            var str = `<span style="text-shadow: 0px 0px 5px black;"> <span style="color:${colors[secret_code[0]]}"><b>${colori[secret_code[0]]}</b></span>,<span style="color:${colors[secret_code[1]]}"><b>${colori[secret_code[1]]}</b></span>,<span style="color:${colors[secret_code[2]]}"><b>${colori[secret_code[2]]}</b></span>,<span style="color:${colors[secret_code[3]]}"><b>${colori[secret_code[3]]}</b></span></span>`;
            terminaPartita("Tempo scaduto. Il codice era " + str);
        } else {
            console.log("Tempo rimasto: " + timeleft);
            // Calcola i minuti e i secondi rimanenti
            localStorage.setItem("timeleft", timeleft);
            
            var minutes = Math.floor(timeleft / 60);
            var seconds = timeleft % 60;
            // Formatta il tempo rimasto come MM:SS
            var formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
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
}
// Funzione per inserire i colori nelle palle
function changeColor(color) {
    // Se la partita è terminata, non fa nulla
    if (end_game) {
        return;
    }
    scrollWin();
    // Seleziona l'elemento div tramite il suo ID
    var targetDiv=0;
    targetDiv = document.getElementById(`ball-${x}-${y}`);
    targetDiv.style.backgroundColor = color;
    if(accessibilita=='true'){
        document.getElementById(`text-ball-${x}-${y}`).innerHTML=colors.indexOf(color);
    }
    Colorful[y-1] = 1;
    //trova il primo elemnto di colorful che è uguale a 0
    var next=0;
    var count=0;

    for (let i = 0; i < 4; i++) {
        if (Colorful[(y - 1 + i) % 4] === 0 && next==0) {
            next=((y - 1 + i) % 4)+1;
        }else{
            count++;
        }
    }
    //va al primo elememto vuoto 
    if(next!=0 ){
        moveBall(next);
    }else {
        if(count!=4){
            moveBall(y+1);
        }
    }
}
// Funzione per rimuovere i colori selezionati quando ci si clicca sopra
function avviaEventi() {
    if(!game_started){
        return;
    }
    console.log("avviaEventi");
    var xatt = x;
    y=1;
    var delItem1= document.getElementById(`delete-ball-${x}-1`);
    var delItem2= document.getElementById(`delete-ball-${x}-2`);
    var delItem3= document.getElementById(`delete-ball-${x}-3`);
    var delItem4= document.getElementById(`delete-ball-${x}-4`);

    var textItem1=document.getElementById(`text-ball-${x}-1`);
    var textItem2=document.getElementById(`text-ball-${x}-2`);
    var textItem3=document.getElementById(`text-ball-${x}-3`);
    var textItem4=document.getElementById(`text-ball-${x}-4`);
    
    // Selezione della prima palla
    var startball = document.getElementById(`ball-${x}-1`);
    startball.classList.add("ball-selected");
    
    // Rimozione dei colori
    var itemElement1 = document.getElementById(`ball-${x}-1`);
    itemElement1.addEventListener('click', () => {
        if (/*Colorful[0] == 1 && */xatt == x) {
            delItem1.setAttribute("hidden", "hidden");
            textItem1.innerHTML="";
            itemElement1.style.backgroundColor = 'white';
            Colorful[0] = 0;
            moveBall(1);
            ;
        }
    });
    //vede se il muose è sopra
    itemElement1.addEventListener("mouseover", () => { 
        if (Colorful[0] == 1 && xatt == x) {
            textItem1.setAttribute("hidden","hidden");
            delItem1.removeAttribute("hidden");
        }
        
    }, false);
    //vede se il mouse è tolto
    itemElement1.addEventListener("mouseleave", () => { 
        delItem1.setAttribute("hidden", "hidden");
        textItem1.removeAttribute("hidden");
    }, false);

    var itemElement2 = document.getElementById(`ball-${x}-2`);
    itemElement2.addEventListener('click', () => {
        if (/*Colorful[1] == 1 &&*/ xatt == x) {
            delItem2.setAttribute("hidden", "hidden");
            textItem2.innerHTML="";
            itemElement2.style.backgroundColor = 'white';
            Colorful[1] = 0;
            moveBall(2);
            ;
        }
    });
    itemElement2.addEventListener("mouseover", () => { 
        if (Colorful[1] == 1 && xatt == x) {
            textItem2.setAttribute("hidden","hidden");
            delItem2.removeAttribute("hidden");
        }
        
    }, false);
    itemElement2.addEventListener("mouseleave", () => { 
        delItem2.setAttribute("hidden", "hidden");
        textItem2.removeAttribute("hidden");
    }, false);



    var itemElement3 = document.getElementById(`ball-${x}-3`);
    itemElement3.addEventListener('click', () => {
        if (/*Colorful[2] == 1 && */xatt == x) {
            delItem3.setAttribute("hidden", "hidden");
            textItem3.innerHTML="";
            itemElement3.style.backgroundColor = 'white';
            Colorful[2] = 0;
            moveBall(3);
        }
    });
    itemElement3.addEventListener("mouseover", () => {
        if (Colorful[2] == 1 && xatt == x) {
            textItem3.setAttribute("hidden","hidden");
            delItem3.removeAttribute("hidden");

        }
    }
    , false);
    itemElement3.addEventListener("mouseleave", () => {
        delItem3.setAttribute("hidden", "hidden");
        textItem3.removeAttribute("hidden");
    }
    , false);

    var itemElement4 = document.getElementById(`ball-${x}-4`);
    itemElement4.addEventListener('click', () => {
        if (/*Colorful[3] == 1 && */xatt == x) {
            delItem4.setAttribute("hidden", "hidden");
            textItem4.innerHTML="";
            itemElement4.style.backgroundColor = 'white';
            Colorful[3] = 0;
            moveBall(4);
            
        }
    });
    itemElement4.addEventListener("mouseover", () => {
        if (Colorful[3] == 1 && xatt == x) {
            textItem4.setAttribute("hidden","hidden");
            delItem4.removeAttribute("hidden");
        }
        
    }
    , false);
    itemElement4.addEventListener("mouseleave", () => {
        delItem4.setAttribute("hidden", "hidden");
        textItem4.removeAttribute("hidden");
    }
    , false);
}

// Funzione che fa scorrere lo schermo al div successivo
function scrollWin() {
    var screenHeight=window.innerHeight;
    var targetElement;
    // Verifica se il turno corrente è maggiore di 2
    if (x > 2) {
        // Se sì, seleziona l'elemento div target tramite il suo ID
        if(screenHeight <= 300){
            targetElement = document.getElementById(`rig-${x}`);
            console.log("Ciaoooo");
        }else if(screenHeight <= 600){
            targetElement = document.getElementById(`rig-${x-1}`);
        }else{
            targetElement = document.getElementById(`rig-${x-2}`);
        }
        // Scorri lo schermo in modo fluido verso l'elemento target
        targetElement.scrollIntoView({
            behavior: 'smooth',  
        });
    }else{
        targetElement = document.getElementById(`rig-${x}`);
        if(x>=1 && screenHeight <= 370){
            targetElement = document.getElementById(`rig-${x+2}`);
        }
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'end'
        });
    
    }
}
/*Funzione per terminare la partita se il gioco è online manda il risulato al server
La funzione prende come argomento un messaggio da stampare a schermo
Imposta la variabile x a 0 per indicare che la partita è terminata
Imposta la variabile end_game a true per indicare che la partita è terminata
Disabilita il pulsante con id "invcod"
Aggiunge un ritardo di 500 millisecondi per mostrare il risultato
Mostra un messaggio di vittoria o sconfitta a schermo in base al valore della variabile win
Mostra un modal con il messaggio di vittoria o sconfitta*/
function terminaPartita(msg){   
    
    end_game = true;
    console.log("termina partita");
    localStorage.clear();
   
    blockbutton();
    var prevBall = document.getElementById(`ball-${x}-${y}`);
    prevBall.classList.remove("ball-selected");
    // Aggiungi un ritardo per far vedere il risultato
    setTimeout(()=> {
        // Mostra il titolo del modal in base al risultato
        if(win){
            document.getElementById("md_title").innerHTML = "Complimenti hai vinto";
        }else if(draw){
            document.getElementById("md_title").innerHTML = "Pareggio";
        }else {
            document.getElementById("md_title").innerHTML = "Mi dispiace hai perso";
        }
        // Mostra il messaggio nel corpo del modal
        
        
        // Mostra il modal
        if(modal_err!=null){
            modal_err.hide();
        }
        console.log(msg);
        document.getElementById("md_body").innerHTML = msg;
        const modal = new bootstrap.Modal('#md_end');
        modal.show();
    }, 500);
}

function blockbutton(){
    document.getElementById("invcod").disabled = true;
    document.getElementById("btn-color-1").disabled = true;
    document.getElementById("btn-color-2").disabled = true;
    document.getElementById("btn-color-3").disabled = true;
    document.getElementById("btn-color-4").disabled = true;
    document.getElementById("btn-color-5").disabled = true;
    document.getElementById("btn-color-6").disabled = true;
    document.getElementById("btn-color-7").disabled = true;
    document.getElementById("btn-color-8").disabled = true;
    document.getElementById("dx-btn").disabled = true;
    document.getElementById("sx-btn").disabled = true;
    document.getElementById("cancCol").disabled = true;
}

//Funzione per convertire il codice in stringa di colori
function codiceToString(codice){
    var str_code_arr=[];
    for (let i = 0; i < codice.length; i++) {
        str_code_arr.push(colors[codice[i]]);
    }
    return str_code_arr;
}

//Funzione per convertire colori in codice dato un array di colori genera il codice corrispondente
function stringToCodice(col){
    var codice = [];
    if (col.length != 4) {
        return "Errore";
    }
    for (let i = 0; i < col.length; i++) {
        codice.push(colors.indexOf(col[i]));
    }
    return codice;
}

//funzione per spostare la palla selezionata distattiva l'animazine di quella attuale e attiva
//l'animazione della nuova palla selezionata
function moveBall(y_suc) {
    // Verifica se la partita è terminata, non fa nulla
    if (end_game) {
        return;
    }
    // Rimuove la classe "ball-selected" dalla palla precedente
    var prevBall = document.getElementById(`ball-${x}-${y}`);
    prevBall.classList.remove("ball-selected");

    // Aggiorna la variabile y con il nuovo valore
    if(y_suc>4){
        y=1;
    }else if(y_suc<1){
        y=4;
    }else{
        y=y_suc;
    }
    // Aggiunge la classe "ball-selected" alla nuova palla selezionata
    var nextBall = document.getElementById(`ball-${x}-${y}`);
    nextBall.classList.add("ball-selected");
}
//funzione per mandare avanti(spostarla a destra) di uno la colonna
function dx(){
    scrollWin();
    moveBall(y+1);
}
//uguale a sopra ma a sinistra
function sx(){
    scrollWin();
    moveBall(y-1);
}
//rimuove il colore e lasci la palla selezionata
function dellColor(){
    scrollWin();
    var itemElement = document.getElementById(`ball-${x}-${y}`);
    if(accessibilita=='true'){
        document.getElementById(`text-ball-${x}-${y}`).innerHTML="";
    }
    if(Colorful[y-1]==1){
        itemElement.style.backgroundColor = 'white';
        Colorful[y-1] = 0;
    }else{
        //itemElement.style.backgroundColor = 'white';
        Colorful[y-1] = 0;
        if(y!=1){
            sx();  
        }
   } 
}
//attiva le lettura da input di tastiera
function keyButton(){
    document.addEventListener('keydown', function(event) {
        if(event.key != 'F12'){
            event.preventDefault();
        }
        if(!modal_aperto){
            if(event.key ==='Enter'){
                if(window.location.href.includes("?id=")){
                    confrontaCodiciPVP();
                }else{
                    confrontaCodici();
                }
            }else if(event.key ==='Backspace') {
                dellColor();
            }else if(event.key ==='ArrowLeft'){
                sx();
            }else if(event.key ==='ArrowRight'){
                dx();
            }else{
                if(event.key === '1') {
                    changeColor("red");
                }
                else if(event.key === '2') {
                    changeColor("darkgreen");
                }
                else if(event.key === '3') {
                    changeColor("darkblue");
                }
                else if(event.key === '4') {
                    changeColor("deeppink");
                }
                else if(event.key === '5') {
                    changeColor("yellow");
                }
                else if(event.key === '6') {
                    changeColor("purple");
                }
                else if(event.key === '7') {
                    changeColor("aqua");
                }
                else if(event.key === '8') {
                    changeColor("sienna");
                }
            }
            return;
        }
    });
}

