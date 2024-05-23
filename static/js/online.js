
/**modifica il modal per permettere di inserire il docide della stanza*/
function iserisciCodice(){
    var md_title = document.getElementById("md_title");
    md_title.setAttribute("hidden", "hidden");
    var left = document.getElementById("left_bn");
    var right = document.getElementById("right_bn");
   
    var body = document.getElementById("md_body_online");
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

/**
 * Annulla le modifiche dopo un ritardo di 600 millisecondi.
 */
function annulla(){
    setTimeout(function() {
        var md_title = document.getElementById("md_title");
        md_title.removeAttribute("hidden");
        var body = document.getElementById("md_body_online");
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
        var err=document.getElementById("err");
        err.innerHTML="";

    }, 600);
}

/**chiama il modal per le partite online del file index.html */
function callModal(){
    setTimeout(function() {
        const modal = new bootstrap.Modal('#md_online');
        modal.show();
    }, 400);
}