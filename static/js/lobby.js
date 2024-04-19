var frasi=["Senza matematica; ma dove siamo?","SI È MESSO A FASE SELECTION SORTTT!!!","Nel complesso, sai cheee"];
var frasiUsate = [];

function rotazione(){
    randomFrasi();
    //imposta una pausa di 2 secondi
    setTimeout(rotazione, 6999);
}

function randomFrasi(){
    var frasiDisponibili = frasi.filter(function(frase) {
        return !frasiUsate.includes(frase);
    });

    if (frasiDisponibili.length === 0) {
        // All phrases have been used, reset the used phrases array
        frasiUsate = [];
        frasiDisponibili = frasi;
    }

    var random = Math.floor(Math.random() * frasiDisponibili.length);
    var frase = frasiDisponibili[random];
    frasiUsate.push(frase);

    document.getElementById("frasi").innerHTML = frase;
}