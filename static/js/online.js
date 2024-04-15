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


function iserisciCodice(){
    var body = document.getElementById("md_body");
    //inserisci un form html per inserire il codice
    body.innerHTML = '<div>Inserisci il codice della stanza</div><input type="text" id="game_code" name="game_code" ></input>';
    var left = document.getElementById("left_bn");
    var right = document.getElementById("right-bn");
    //cambia gli elemeti della classe di sinistra
    left.className = "btn btn-danger";
    left.innerHTML = "Annulla";
    left.setAttribute("onclick","annulla()");
    right.innerHTML = "Entra";
    right.setAttribute("onclick","entrasta()");
}

function annulla(){
    setTimeout(function() {
        var body = document.getElementById("md_body");
        body.innerHTML = "Gioca online con i tuoi amici";
        var left = document.getElementById("left_bn");
        var right = document.getElementById("right_bn");
        left.className = "btn btn-info";
        left.innerHTML = "Crea una stanza";
        left.setAttribute("onclick","window.location.href = `{{ url_for('lobby') }}`");
        right.innerHTML = "Entra in una stanza";
        right.setAttribute("onclick","iserisciCodice()");
    }, 600);
}