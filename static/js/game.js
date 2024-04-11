function confrontaCodici(codice1, codice2) {
    let posizioneCorretta = 0;
    let posizioneErrata = 0;
    let sbagliato = 0;
    const codice2Copy = [...codice2]; // create a copy of codice2 to avoid modifying the original array
    for (let i = 0; i < codice1.length; i++) {
        if (codice1[i] === codice2Copy[i]) {
            posizioneCorretta++;
            codice2Copy[i] = null; // mark the element as used to avoid counting it as an error again
        } else if (codice2Copy.includes(codice1[i])) {
            posizioneErrata++;
            const index = codice2Copy.indexOf(codice1[i]);
            codice2Copy[index] = null; // mark the element as used to avoid counting it as an error again
        }else{
            sbagliato++;
        }
    }

    if(posizioneCorretta === 4){
        document.getElementById("codice").innerHTML = `Hai vinto!`;
    }
    //cambiare "nome giusto"
    document.getElementById("codice").innerHTML = `Posizione corretta: ${posizioneCorretta} - Posizione errata: ${posizioneErrata}- sbagliato: ${sbagliato}`;
}


function startPVE() {
  const pin = [];
  for (let i = 0; i < 4; i++) {
    pin.push(Math.floor(Math.random() * 10));
  }
  console.log(pin);
  return pin;
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

