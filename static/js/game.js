var x=3;
var Colorful=[0,0,0,0];
var secret_code=[];//mettere a false
var debug = true;
var colors = ["white", "red", "green", "blue", "yellow", "orange","purple","gold","skyblue"];
var end_game = false;
var timeleft = 900; // 15 minuti in secondi

function confrontaCodici() {
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
        var codelm = document.getElementById(`item-${x}-${i*2+3}`);
        player_code.push(colors.indexOf(codelm.style.backgroundColor));
    }
    //confronta i valori inseriti dal giocatore con il codice segreto
    const copysc = [...secret_code]; // create a copy of codice2 to avoid modifying the original array
    for (let i = 0; i < player_code.length; i++) {
        if (player_code[i] === copysc[i]) {
            posizioneCorretta++;
            copysc[i] = null; // mark the element as used to avoid counting it as an error again
        } else if (copysc.includes(player_code[i])) {
            posizioneErrata++;
            const index = copysc.indexOf(player_code[i]);
            copysc[index] = null; // mark the element as used to avoid counting it as an error again
        }else{
            sbagliato++;
        }
    }
    //vede se il giocatore ha vinto o perso e passa al prossimo turno
    if(posizioneCorretta === 4){
        end_game = true;
        document.getElementById("risultato").innerHTML = `Hai vinto!`;
        //chiamata alla funzione termina partita
        terminaPartita("Hai vinto!");
    }else if(x>31 ){
        x=0;
        end_game = true;
        document.getElementById("risultato").innerHTML = `Hai perso!`;
        //chiamata alla funzione termina partita
        terminaPartita("Hai perso!");
    }else{
        document.getElementById("risultato").innerHTML = `Posizione corretta: ${posizioneCorretta} - Posizione errata: ${posizioneErrata}- sbagliato: ${sbagliato}`;
        x=x+4;
        Colorful=[0,0,0,0];
     
        avviaEventi();
    }
}


function startPVE() {
    if (debug) {
        secret_code = [1, 1, 2, 3];//il codiece di debug è red red green blue
    }else{
        for (let i = 0; i < 4; i++) {
            secret_code.push(Math.floor(Math.random() * 9));
        }
         console.log(secret_code);
    }
    Colorful=[0,0,0,0];
    x=3;
    end_game = false;
    game_timer();
}

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
            terminaPartita("Tempo scaduto!");
        } else {
            var minutes = Math.floor(timeleft / 60);
            var seconds = timeleft % 60;
            var formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById("countdown").innerHTML ="Tempo alla fine della partita: "+ formattedTime;
        }
        timeleft--;
        if (end_game) {
            clearInterval(downloadTimer);
        }
    }, 1000);
}

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
            targetDiv = document.getElementById(`item-${x}-${i*2+3}`);
            targetDiv.style.backgroundColor = color;
            console.log("colorato"+(i*2+3));
            break;
        }
        
    }
}

function avviaEventi(){
    console.log("avviaEventi");
    var xatt=x
    //rimozione colori
   
   
    var itemElement1 = document.getElementById(`item-${x}-3`);
    itemElement1.addEventListener('click', () => {
        if(Colorful[0]==1 && xatt==x){
            itemElement1.style.backgroundColor = 'white';
            Colorful[0] = 0; 
            console.log(x + " rimosso");
            
        }
        
    });


    var itemElement2 = document.getElementById(`item-${x}-5`);

    itemElement2.addEventListener('click', () => {
        itemElement2.addEventListener('click', () => {
            if(Colorful[1] ==1 && xatt==x){
                itemElement2.style.backgroundColor = 'white';
                Colorful[1] = 0; 
                console.log("rimosso");
            }
        });
    });



    var itemElement3 = document.getElementById(`item-${x}-7`);
    itemElement3.addEventListener('click', () => {
        if(Colorful[2] ==1&& xatt==x){
            itemElement3.style.backgroundColor = 'white';
            Colorful[2] = 0; 
            console.log("rimosso");
        }
        });



    var itemElement4 = document.getElementById(`item-${x}-9`);
    itemElement4.addEventListener('click', () => {
        if(Colorful[3] ==1 && xatt==x){
            itemElement4.style.backgroundColor = 'white';
            Colorful[3] = 0; 
            console.log("rimosso");
        }
    });
    
    //mause over per far apparire la scritta rimuovi colore
    
    /*
    let test = document.getElementById(`item-${x}-3`);
    test.addEventListener("mouseleave", () => { 
        test.textContent = test.style.backgroundColor;
    }, false);
    test.addEventListener("mouseover", () => {
        test.textContent = "mouse in";
    });
    */
}


//TODO funzione termina partita
function terminaPartita(msg){
    x=0;
    end_game = true;
    console.log("termina partita");
    document.getElementById("invcod").disabled = true;
    alert(msg);
}
