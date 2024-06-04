var secretCode;
var timerCodeLeft ;
var interval
var block_tasti_tastira=false;


function readCode(){
    var one = document.getElementById("ball-1-1");
    var two = document.getElementById("ball-1-2");
    var three = document.getElementById("ball-1-3");
    var four = document.getElementById("ball-1-4");
    var colors = [one.style.backgroundColor, two.style.backgroundColor, three.style.backgroundColor, four.style.backgroundColor];
    for (let i = 0; i < 4; i++) {
        if(colors[i] == "" || colors[i] == "white"){
            document.getElementById("md_err_body").innerHTML = "Inserisci tutti i colori prima di confermare il codice!";
            modal_err = new bootstrap.Modal('#md_err');
            modal_err.show();
            modal_aperto=true;
            return;
        }
    }
    secretCode = stringToCodice(colors);

   
}

function keyButton_code(){
    document.addEventListener('keydown', function(event) {
        if(event.key != 'F12'){
            event.preventDefault();
        }

        if(block_tasti_tastira){
            return;
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

/**
 * funzione che colora le palline con i colori del codice generato casulaemente
 */
function colorCasualCode(){
    var coliri_codice_casuale=codiceToString(secretCode);
    for (let i = 0; i < 4; i++) {
        document.getElementById(`ball-1-${i+1}`).style.backgroundColor = coliri_codice_casuale[i];
    }
}
/**
 * funzione che se il gocatore non ha inserito tutti i colori allo scader del tempo 
 * genera un codce randomico semple (cioe senza ripetizioni)
 */
function timerCode(){
    var codeValid=true;
    if(localStorage.getItem('timerCode') != null){
        timerCodeLeft = localStorage.getItem('timerCode');
        console.log("timerCodeLeft: "+timerCodeLeft);
    }else{
        timerCodeLeft = 30;
    }
   
    interval=setInterval(()=> {
        timerCodeLeft--;
        console.log("timerCodeLeft: a"+timerCodeLeft);
        if(block_tasti_tastira){
            clearInterval(interval);
            return;
        }
        if(timerCodeLeft <= 0){
            localStorage.setItem('timerCode', 0);
            document.getElementById("countdown").innerHTML = "Tempo scaduto!";
            clearInterval(interval);
            for(let i = 0; i < 4; i++){
                
                var readColor=document.getElementById(`ball-1-${i+1}`).style.backgroundColor;
                if(readColor == "" || readColor == "white"){
                    codeValid=false;
                    break;
                }
            }
            if(codeValid){
                console.log("codice inserito");
                sendCode()
            }else{
                secretCode = createEasyCode();
                colorCasualCode();
                sendCode(false);
            }
            
        }else{
            localStorage.setItem('timerCode', timerCodeLeft);
            var minutes = Math.floor(timerCodeLeft / 60);
            var seconds = timerCodeLeft % 60;
            // Formatta il tempo rimasto come MM:SS
            var formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            // Aggiorna l'elemento HTML con il tempo rimasto
            document.getElementById("countdown").innerHTML = "Tempo rimasto " + formattedTime;
        }

    }, 1000);
}


function sendCode(read=true){
    if(read){
        readCode();
        msg="Codice inviato! Attendere che l'avversario inserisca il codice per iniziare la partita!";
    }else{
        msg="Tempo scaduto, codice casuale generato! Attendere che l'avversario inserisca il codice per iniziare la partita!";
    }
    
    if(secretCode == null){
        return;
    }
    clearInterval(interval);
    document.getElementById(`ball-1-${y}`).classList.remove("ball-selected");
    blockbutton();
    document.getElementById("md_body_code").innerHTML = msg;
    if(modal_err!=null){
        modal_err.hide();
    }
    var modal = new bootstrap.Modal('#md_msg_code');
    modal.show();
    var code = secretCode.join('');
    
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
                msg="Codice inviato! Attendere che l'avversario inserisca il codice per iniziare la partita!";
                document.getElementById("md_body_code").innerHTML = msg;
                var modal = new bootstrap.Modal('#md_msg_code');
                modal.show();
                block_tasti_tastira=true;
                var codeArray = code.split('').map(Number);
                console.log(codeArray);
                for (let j = 0; j < 4; j++) {
                    var codelm = document.getElementById(`ball-1-${j + 1}`);
                    codelm.style.backgroundColor = colors[codeArray[j]];
                    var accessibilita=localStorage.getItem('accessibility')
                    if(accessibilita=='true'){
                        document.getElementById(`text-ball-1-${j+1}`).innerHTML=colors.indexOf(colors[codeArray[j]]);
                    }
                }
                hasInsertedCode();
            }
        }
    });
}

function disableButtons(){
    var buttons = document.getElementsByClassName("btn-manage");
    var colors_buttons = document.getElementsByClassName("input-color-button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
        
    }
    for (let i = 0; i < colors_buttons.length; i++) {
        colors_buttons[i].disabled = true;
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
                isConnected();
                if(inserted){
                    window.location.href = "/online-game?id=" + idGame;
                }
            }
        });
    }, 500);
}

function isConnected(){
    var data = {id: idGame};
    $.get('/isConnected', function(data) {
            var disconnect = data.disconnect;
            var connected = data.connected;
            console.log(disconnect);
            if(disconnect || !connected){
                window.location.href = "/errmsg";
            }
    });


}