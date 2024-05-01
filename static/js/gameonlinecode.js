



modal_aperto=false;
var secretCode;
var colors = ["white", "red", "darkgreen", "darkblue", "deeppink", "yellow","purple","aqua","sienna"];

function readCode(){
    var one = document.getElementById("ball-1-1");
    var two = document.getElementById("ball-1-2");
    var three = document.getElementById("ball-1-3");
    var four = document.getElementById("ball-1-4");
    var colors = [one.style.backgroundColor, two.style.backgroundColor, three.style.backgroundColor, four.style.backgroundColor];
    for (let i = 0; i < 4; i++) {
        if(colors[i] == "" || colors[i] == "white"){
            document.getElementById("md_err_body").innerHTML = "Inserisci tutti i colori prima di confermare il codice!";
            const modal = new bootstrap.Modal('#md_err');
            modal.show();
            modal_aperto=true;
            return;
        }
    }
    secretCode = stringToCodice(colors);
    console.log(secretCode);
   
}
function keyButton_code(){
    document.addEventListener('keydown', function(event) {
        if(event.key != 'F12'){
            event.preventDefault();
        }
        if(!modal_aperto){
            if(event.key ==='Enter'){
                sendCode();
                return;
            }
            if(event.key ==='Backspace') {
                dellColor();
                return;
            }else if(event.key ==='ArrowLeft'){
                sx();
                return;
            }else if(event.key ==='ArrowRight'){
                dx();
                return;
            }
             else{
                if(event.key === '1') {
                    changeColor("red");
                    return;
                }
                else if(event.key === '2') {
                    changeColor("darkgreen");
                    return;
                }
                else if(event.key === '3') {
                    changeColor("darkblue");
                    return;
                }
                else if(event.key === '4') {
                    changeColor("deeppink");
                    return;
                }
                else if(event.key === '5') {
                    changeColor("yellow");
                    return;
                }
                else if(event.key === '6') {
                    changeColor("purple");
                    return;
                }
                else if(event.key === '7') {
                    changeColor("aqua");
                    return;
                }
                else if(event.key === '8') {
                    changeColor("sienna");
                    return;
                }
            }
        }
    });
}

function sendCode(){
    readCode();
    if(secretCode == null){
        return;
    }
    var code = secretCode.join('');
    console.log(code);
    var data = {code: code, id: idGame};
    // manda il codice al server
    $.ajax({
        type: "POST",
        url: "/online-game",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function(response){
        }
    });
    // aspetta che l'avversario mandi il codice
    hasInsertedCode();
}

function checkInsertion(){
    var data = {id: idGame};

    $.ajax({
        type: "POST",
        url: "/getSecretCode",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function(response){
            code = response.code;
            if(code != ''){
                disableButtons();
                var codeArray = code.split('').map(Number);
                console.log(codeArray);
                for (let j = 0; j < 4; j++) {
                    var codelm = document.getElementById(`ball-1-${j + 1}`);
                    codelm.style.backgroundColor = colors[codeArray[j]];
                }
                hasInsertedCode();
            }
        }
    });
}

function disableButtons(){
    var buttons = document.getElementsByClassName("btn-manage");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
}

window.onload = function(){
    checkInsertion();
}

function hasInsertedCode(){
    var data = {id: idGame};
    setInterval(function() {
        $.ajax({
            type: "POST",
            url: "/hasInsertedCode",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function(response){
                var inserted = response.inserted;
                if(inserted){
                    window.location.href = "/online-game?id="+idGame;
                }
            }
        });
    }, 500);
}