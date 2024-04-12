var x=3;
var Colorful=[0,0,0,0];
var secret_code=[];
var colors = ["white", "red", "green", "blue", "yellow", "orange","purple","gold","skyblue"];
function confrontaCodici() {
    var posizioneCorretta = 0;
    var posizioneErrata = 0;
    var sbagliato = 0;
    var player_code = [];
    for (let i = 0; i < 4; i++) {
        var codelm = document.getElementById(`item-${x}-${i*2+3}`);
        player_code.push(colors.indexOf(codelm.style.backgroundColor));
    }
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

    if(posizioneCorretta === 4){
        document.getElementById("risultato").innerHTML = `Hai vinto!`;
    }else if(x==31){
        document.getElementById("risultato").innerHTML = `Hai perso!`;
    }else{
        document.getElementById("risultato").innerHTML = `Posizione corretta: ${posizioneCorretta} - Posizione errata: ${posizioneErrata}- sbagliato: ${sbagliato}`;
        x=x+4;
        Colorful=[0,0,0,0];
        avviaEventi();
    }
    //cambiare "nome giusto"
    
}


function startPVE() {
  
  for (let i = 0; i < 4; i++) {
    secret_code.push(Math.floor(Math.random() * 9));
  }
    console.log(secret_code);
}

function creasta() {
    const url = 'http://127.0.0.1:5000/creaStanza'
    fetch(url)
    .then(response => response.json())  
    .then(json => {
        console.log(json);
        var str=json.msg +" " +json.game_code;
        document.getElementById("g1").innerHTML =str;
        
    })
}

function entrasta(){
    const url = 'http://127.0.0.1:5000/entraStanza'
    var pin = document.getElementById("game_code").value;
    fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "pin": pin }),
    })
    .then(response => response.json())  
    .then(json => {
        console.log(json);
        str = "stanza creata da " + json.u1 + " tu sei " + json.u2;
        document.getElementById("g2").innerHTML = str;
    })
}

function changeColor(color) {
    // Select the div element by its ID
    var targetDiv
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
   
    const itemElement = document.getElementById(`item-${x}-3`);
    itemElement.addEventListener('click', () => {
        if(Colorful[0]==1){
            itemElement.style.backgroundColor = 'white';
            Colorful[0] = 0; 
            console.log(x+"rimosso");
        }
        
    });


    var itemElement2 = document.getElementById(`item-${x}-5`);

    itemElement2.addEventListener('click', () => {
        itemElement2.addEventListener('click', () => {
            if(Colorful[1] ==1){
                itemElement2.style.backgroundColor = 'white';
                Colorful[1] = 0; 
                console.log("rimosso");
            }
        });
    });



    var itemElement3 = document.getElementById(`item-${x}-7`);
    itemElement3.addEventListener('click', () => {
        if(Colorful[2] ==1){
            itemElement3.style.backgroundColor = 'white';
            Colorful[2] = 0; 
            console.log("rimosso");
        }
        });



    var itemElement4 = document.getElementById(`item-${x}-9`);
    itemElement4.addEventListener('click', () => {
        if(Colorful[3] ==1){
            itemElement4.style.backgroundColor = 'white';
            Colorful[3] = 0; 
            console.log("rimosso");
        }
    });
    
}



