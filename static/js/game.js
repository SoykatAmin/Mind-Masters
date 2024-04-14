var x=1;
var Colorful=[0,0,0,0];
var secret_code=[];//mettere a false
var debug = true;
//il primo elemento è vuoto per far si che l'indice del colore corrisponda al suo valore nel codice
var colors = ["Sono inutile", "red", "green", "blue", "yellow", "orange","purple","pink","skyblue"];
var colori = ["Non sei l'unico", "rosso", "verde", "blu", "giallo", "arancione", "viola", "rosa", "azzurro"];
var end_game = false;
var timeleft = 900; // 15 minuti in secondi

var win=false;

function confrontaCodici() {
    //fix con colori uguali non va 
    var postrov=[0,0,0,0];
    var posizioneCorretta = 0;
    var posizioneErrata = 0;
    var sbagliato = 0;
    var player_code = [];
    //dirattiva il bottone per evitari eventuale doppio click
    document.getElementById("invcod").disabled = true;

    //riattiva il bottone dopo 1 secondo
    setTimeout(()=> {
        // Abilita il pulsante
        if(!end_game){
            document.getElementById("invcod").disabled = false;
        }
        
    }, 1000);
    //legge i valori dei colori inseriti dal giocatore
    for (let i = 0; i < 4; i++) {
        var codelm = document.getElementById(`ball-${x}-${i+1}`);
        if(codelm.style.backgroundColor == "" || codelm.style.backgroundColor == "white"){
            
            document.getElementById("md_err_body").innerHTML = "Inserisci tutti i colori prima di confermare il codice!";
            const modal = new bootstrap.Modal('#md_err');
            modal.show();
            return;
            
        }else{
            player_code.push(colors.indexOf(codelm.style.backgroundColor));
        }
      
    }
    console.log("Codice giocarore " +player_code);
    //confronta i valori inseriti dal giocatore con il codice segreto
    const copysc = [...secret_code]; // create a copy of codice2 to avoid modifying the original array
    for (let i = 0; i < player_code.length; i++) {
        if (player_code[i] === copysc[i]) {
            postrov[i]=1;
            posizioneCorretta++;
            copysc[i] = null; // mark the element as used to avoid counting it as an error again
        }
    }
    for(let i = 0; i < 4; i++){
        if(postrov[i]===0){
            if (copysc.includes(player_code[i])) {
                posizioneErrata++;
                const index = copysc.indexOf(player_code[i]);
                copysc[index] = null; // mark the element as used to avoid counting it as an error again
            }else{
                sbagliato++;
            }
        }
       
    }
    console.log("Posizione corretta: " + posizioneCorretta + " Posizione errata: " + posizioneErrata + " sbagliato: " + sbagliato);
    //vede se il giocatore ha vinto o perso e passa al prossimo turno
    if(posizioneCorretta === 4){
        suggerimenti(posizioneCorretta,posizioneErrata);
        //chiamata alla funzione termina partita
        win=true;
        if(x==1){
            terminaPartita("che giga chad hai vinto al primo turno!");
        }else{
            terminaPartita("complimenti hai vinto in " +x+ " turni!");
        }
        
    }else if(x==8 ){
        suggerimenti(posizioneCorretta,posizioneErrata);
        var str=colori[secret_code[0]]+","+colori[secret_code[1]]+","+colori[secret_code[2]]+","+colori[secret_code[3]];
        //chiamata alla funzione termina partita
        terminaPartita("Mi dispiace hai perso il codice era " + str);
    }else{
        scrollWin();
        suggerimenti(posizioneCorretta,posizioneErrata);
        Colorful=[0,0,0,0];
        x++;
        avviaEventi();
    }
}
//funzione per inserire i suggerimenti
function suggerimenti(correct,color) {
    var suggestionItem1 = document.getElementById(`suggestion-${x}-1`);
    var suggestionItem2 = document.getElementById(`suggestion-${x}-2`);
    var suggestionItem3 = document.getElementById(`suggestion-${x}-3`);
    var suggestionItem4 = document.getElementById(`suggestion-${x}-4`);
    var occ=[0,0,0,0];
    //riempe l'arry in modo casuola con 1 per per ogni colore coretto ma in posizione errata e 2 per ogni colore coretto e in posizione corretta
    for (let i = 0; i < correct; i++) {
        var r = Math.floor(Math.random() * 4);
        if(occ[r]===0){
            occ[r]=2;
        }else{
            i--;
        }
    }
    for (let i = 0; i < color; i++) {
        var r = Math.floor(Math.random() * 4);
        if(occ[r]===0){
            occ[r]=1;
        }else{
            i--;
        }
    }
    console.log(occ);
    //selezione un item cusuale per il suggerimento
    if(occ[0]==2){
        suggestionItem1.style.backgroundColor = "black";
        suggestionItem1.style.clipPath = "polygon(50% 0%, 100% 100%, 0% 100%)";
    }else if(occ[0]==1){
        suggestionItem1.style.backgroundColor = "black";
        suggestionItem1.style.borderRadius = "50%";
        suggestionItem1.style.border = "1px solid black";
    }else{
        suggestionItem1.style.backgroundColor = "#C19569";
        suggestionItem1.style.border = "1px solid #C19569";
    }
    if(occ[1]==2){
        suggestionItem2.style.backgroundColor = "black";
        suggestionItem2.style.clipPath = "polygon(50% 0%, 100% 100%, 0% 100%)";
    }
    else if(occ[1]==1){
        suggestionItem2.style.backgroundColor = "black";
        suggestionItem2.style.borderRadius = "50%";
        suggestionItem2.style.border = "1px solid black";
    }else{
        suggestionItem2.style.backgroundColor = "#C19569";
        suggestionItem2.style.border = "1px solid #C19569";
    }
    if(occ[2]==2){
        suggestionItem3.style.backgroundColor = "black";
        suggestionItem3.style.clipPath = "polygon(50% 0%, 100% 100%, 0% 100%)";
    }
    else if(occ[2]==1){
        suggestionItem3.style.backgroundColor = "black";
        suggestionItem3.style.borderRadius = "50%";
        suggestionItem3.style.border = "1px solid black";
    }else{
        suggestionItem3.style.backgroundColor = "#C19569";
        suggestionItem3.style.border = "1px solid #C19569";
    }
    if(occ[3]==2){
        suggestionItem4.style.backgroundColor = "black";
        suggestionItem4.style.clipPath = "polygon(50% 0%, 100% 100%, 0% 100%)";
    }
    else if(occ[3]==1){
        suggestionItem4.style.backgroundColor = "black";
        suggestionItem4.style.borderRadius = "50%";
        suggestionItem4.style.border = "1px solid black";
    }else{
        suggestionItem4.style.backgroundColor = "#C19569";
        suggestionItem4.style.border = "1px solid #C19569";
    }
    
}
//funzione per iniziare la partita
function startPVE() {
    if (debug) {
        secret_code = [1, 1, 2, 3];//il codiece di debug è red red green blue
    }else{
        for (let i = 0; i < 4; i++) {
            secret_code.push(Math.floor(Math.random() * 8)+1);
        }
         
    }
    console.log(secret_code);
    Colorful=[0,0,0,0];
    x=1;
    end_game = false;
    game_timer();
}
//funzione per il timer
function game_timer() {
    if (debug) {
        timeleft = 120; // 1 minute in seconds
    }
    var downloadTimer = setInterval(()=>{
        if(timeleft <= 0){
            clearInterval(downloadTimer);
            //ciamera la funzione termina partita TODO
            end_game = true;
            document.getElementById("countdown").innerHTML = "Tempo scaduto";
            var str=colori[secret_code[0]]+","+colori[secret_code[1]]+","+colori[secret_code[2]]+","+colori[secret_code[3]];    
            terminaPartita("Mi dispiace tempo finito il codice era " + str);
        } else {
            var minutes = Math.floor(timeleft / 60);
            var seconds = timeleft % 60;
            var formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById("countdown").innerHTML ="Tempo rimasto "+ formattedTime;
        }
        timeleft--;
        if (end_game) {
            clearInterval(downloadTimer);
        }
    }, 1000);
}
//funzione per inserire i colori
function changeColor(color) {
    // Select the div element by its ID
    var targetDiv
    //se end_game è true non fa nulla
    if(end_game){
        return;
    }
    for (let i = 0; i < 4; i++) {
        if(Colorful[i] === 0){
            Colorful[i] = 1; // Set the colored flag
            console.log("colorato"+(i));
            targetDiv = document.getElementById(`ball-${x}-${i+1}`);
            targetDiv.style.backgroundColor = color;
            
            break;
        }
        
    }
}
//funzione per rimuovere i colori
function avviaEventi(){
    console.log("avviaEventi");
    var xatt=x
    //rimozione colori
   
   
    var itemElement1 = document.getElementById(`ball-${x}-1`);
    itemElement1.addEventListener('click', () => {
        if(Colorful[0]==1 && xatt==x){
            itemElement1.style.backgroundColor = 'white';
            Colorful[0] = 0; 
            console.log(x + " rimosso");
            
        }
        
    });


    var itemElement2 = document.getElementById(`ball-${x}-2`);

    itemElement2.addEventListener('click', () => {
        itemElement2.addEventListener('click', () => {
            if(Colorful[1] ==1 && xatt==x){
                itemElement2.style.backgroundColor = 'white';
                Colorful[1] = 0; 
                console.log("rimosso");
            }
        });
    });



    var itemElement3 = document.getElementById(`ball-${x}-3`);
    itemElement3.addEventListener('click', () => {
        if(Colorful[2] ==1&& xatt==x){
            itemElement3.style.backgroundColor = 'white';
            Colorful[2] = 0; 
            console.log("rimosso");
        }
        });



    var itemElement4 = document.getElementById(`ball-${x}-4`);
    itemElement4.addEventListener('click', () => {
        if(Colorful[3] ==1 && xatt==x){
            itemElement4.style.backgroundColor = 'white';
            Colorful[3] = 0; 
            console.log("rimosso");
        }
    });
    
    //mause over per far apparire la scritta rimuovi colore
    
    /*
    let test = document.getElementById(`ball-${x}-3`);
    test.addEventListener("mouseleave", () => { 
        test.textContent = test.style.backgroundColor;
    }, false);
    test.addEventListener("mouseover", () => {
        test.textContent = "mouse in";
    });
    */
}

//funzione che fa scorrere lo schermo al div dopo
function scrollWin() {
    if(x>2){
        const targetElement = document.getElementById(`rig-${x-2}`);
        targetElement.scrollIntoView({
            behavior: 'smooth'
        });
    }
}
//TODO funzione termina partita
function terminaPartita(msg){
    x=0;
    end_game = true;
    console.log("termina partita");
   
    document.getElementById("invcod").disabled = true;
    //aggiungi un dilay per far vedere il risultato
    setTimeout(()=> {
        // Abilita il pulsante
        if(win){
            document.getElementById("md_title").innerHTML = "Complimeti hai vinto";
        }else{
            document.getElementById("md_title").innerHTML = "Mi dispiace hai perso";
        }
        document.getElementById("md_body").innerHTML = msg;
        
        
        const modal = new bootstrap.Modal('#md_end');
        modal.show();
       
        
    }, 500);
   
}
