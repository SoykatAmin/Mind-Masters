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