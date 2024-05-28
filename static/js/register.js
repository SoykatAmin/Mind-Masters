// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the input element
    const passwordInput = document.getElementById('password');
    const frase = document.getElementById('frase_pw');
    const char = document.getElementById('char_pw');
    const num = document.getElementById('num_pw');
    const maiusc = document.getElementById('maiusc_pw');
    const minus = document.getElementById('minus_pw');
    const char_spunta = document.getElementById('char_spunta');
    const num_spunta = document.getElementById('num_spunta');
    const maiusc_spunta = document.getElementById('maiusc_spunta');
    const minus_spunta = document.getElementById('minus_spunta');
    const bottone = document.getElementById('register-button');
    var char_bool = false;
    var num_bool = false;
    var maiusc_bool = false;
    var minus_bool = false;

    // Add an event listener to the input element
    passwordInput.addEventListener('input', function() {
        // Get the entered password
        const enteredPassword = passwordInput.value;

        // Perform your desired password validation logic here
        // For example, check if the password meets certain criteria
        if (enteredPassword.length >= 8) {
            char_bool = true;
            char.style.color = "lightgreen";
            char_spunta.innerHTML = "&#x2713";
        } else {
            char_bool = false;
            char.style.color = "rgb(255, 51, 51)";
            char_spunta.innerHTML = "&#x2022";
            
        }
        if(enteredPassword.match(/[0-9]/)){
            num_bool = true;
            num.style.color = "lightgreen";
            num_spunta.innerHTML = "&#x2713";
        } else {
            num_bool = false;
            num.style.color = "rgb(255, 51, 51)";
            num_spunta.innerHTML = "&#x2022";
        }
        if(enteredPassword.match(/[A-Z]/)){
            maiusc_bool = true;
            maiusc.style.color = "lightgreen";
            maiusc_spunta.innerHTML = "&#x2713";
        } else {
            maiusc_bool = false;
            maiusc.style.color = "rgb(255, 51, 51)";
            maiusc_spunta.innerHTML = "&#x2022";
        }
        if(enteredPassword.match(/[a-z]/)){
            minus_bool = true;
            minus.style.color = "lightgreen";
            minus_spunta.innerHTML = "&#x2713";
        } else {
            minus_bool = false;
            minus.style.color = "rgb(255, 51, 51)";
            minus_spunta.innerHTML = "&#x2022";
        }
        if(char_bool && num_bool && maiusc_bool && minus_bool){
            frase.style.color = "lightgreen";
            bottone.disabled = false;
        } else {
            frase.style.color = "rgb(255, 51, 51)";
            bottone.disabled = true;
        }
    });
});