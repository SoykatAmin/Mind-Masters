function confrontaCodici(codice1, codice2) {
    let posizioneCorretta = 0;
    let posizioneErrata = 0;
    console.log(codice1, codice2);
    const codice2Copy = [...codice2]; // create a copy of codice2 to avoid modifying the original array
    for (let i = 0; i < codice1.length; i++) {
        if (codice1[i] === codice2Copy[i]) {
            posizioneCorretta++;
            codice2Copy[i] = null; // mark the element as used to avoid counting it as an error again
        } else if (codice2Copy.includes(codice1[i])) {
            posizioneErrata++;
            const index = codice2Copy.indexOf(codice1[i]);
            codice2Copy[index] = null; // mark the element as used to avoid counting it as an error again
        }
    }
    //inserire i valorei al unterno di un div con il tag id="codice"
    document.getElementById("codice").innerHTML = `Posizione corretta: ${posizioneCorretta} - Posizione errata: ${posizioneErrata}`;
}


function generateCode() {
  const pin = [];
  for (let i = 0; i < 4; i++) {
    pin.push(Math.floor(Math.random() * 10));
  }
  
  return pin;
}