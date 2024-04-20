var frasi=["Senza matematica; ma dove siamo?","SI È MESSO A FASE SELECTION SORTTT!!!","Nel complesso, sai cheee", "Il sito si trova alla versione: 1982783","Sapevi che i numeri da 1 a 8 da tasiera ti permettono di inserire i colori "];
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
    console.log(frasiDisponibili);
    if(frasiDisponibili.length === 1 ){
        ultimaFrase = frasiDisponibili[0];
    }
    
    var random = Math.floor(Math.random() * frasiDisponibili.length);
    var frase = frasiDisponibili[random];
    frasiUsate.push(frase);
   
    document.getElementById("frasi").innerHTML = frase;
}