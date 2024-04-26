var script = document.createElement('script');
script.src = 'online.js';
document.head.appendChild(script);

var secretCode;

function readCode(){
    var one = document.getElementById("ball-1-1");
    var two = document.getElementById("ball-1-2");
    var three = document.getElementById("ball-1-3");
    var four = document.getElementById("ball-1-4");
    var colors = [one.style.backgroundColor, two.style.backgroundColor, three.style.backgroundColor, four.style.backgroundColor];
    secretCode = stringToCodice(colors);
    console.log(secretCode);
}

/* Override */
function keyButton(){
    document.addEventListener('keydown', function(event) {
        if(event.key != 'F12'){
            event.preventDefault();
        }
        if(!modal_aperto){
            if(event.key ==='Enter'){
                readCode();
                sendCode();
                window.location.href = "gioco-computer";
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
    var code = secretCode.join('');
    var data = {code: code, id: idGame};
    $.ajax({
        type: "POST",
        url: "/online-game",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function(response){
            var id = response.id;
            window.location.href = "/online-game?id="+id;
        }
    });
}