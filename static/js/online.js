var colors = ["Sono copiato", "red", "green", "blue", "yellow", "orange","purple","pink","skyblue"];
//funzioni da finire poi vanno commentate

function creasta() {
    const url = 'http://127.0.0.1:5000/creaStanza'
    fetch(url)
    .then(response => response.json())  
    .then(json => {
        console.log(json);
        var str=json.game_code;
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
        str = "stanza creata da " + json.u;
        document.getElementById("g2").innerHTML = str;
    })
}

//modifica il modal per permettere di inserire il docide della stanza
function iserisciCodice(){
    var md_title = document.getElementById("md_title");
    md_title.setAttribute("hidden", "hidden");
    var left = document.getElementById("left_bn");
    var right = document.getElementById("right_bn");
   
    var body = document.getElementById("md_body");
    body.setAttribute("hidden", "hidden");
    var body_cod= document.getElementById("md_body_cod");
    body_cod.removeAttribute("hidden");
    left.setAttribute("hidden", "hidden");
    right.setAttribute("hidden", "hidden");
    var left_code = document.getElementById("left_bn_code");
    var right_code = document.getElementById("right_bn_code");
    left_code.removeAttribute("hidden");
    right_code.removeAttribute("hidden");
    


}
//
/**
 * Annulla le modifiche dopo un ritardo di 600 millisecondi.
 */
function annulla(){
    setTimeout(function() {

        var md_title = document.getElementById("md_title");
        md_title.removeAttribute("hidden");
        var body = document.getElementById("md_body");
        body.removeAttribute("hidden");
        var left = document.getElementById("left_bn");
        var right = document.getElementById("right_bn");
        left.removeAttribute("hidden"); 
        right.removeAttribute("hidden");
        var body_cod= document.getElementById("md_body_cod");
        body_cod.setAttribute("hidden", "hidden");
        var left_code = document.getElementById("left_bn_code");
        var right_code = document.getElementById("right_bn_code");
        left_code.setAttribute("hidden", "hidden");
        right_code.setAttribute("hidden", "hidden");
    }, 600);
}