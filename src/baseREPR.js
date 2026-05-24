/*
     ____                 _____  ______ _____  _____  
    |  _ \               |  __ \|  ____|  __ \|  __ \ 
    | |_) | __ _ ___  ___| |__) | |__  | |__) | |__) |
    |  _ < / _` / __|/ _ \  _  /|  __| |  ___/|  _  / 
    | |_) | (_| \__ \  __/ | \ \| |____| |    | | \ \ 
    |____/ \__,_|___/\___|_|  \_\______|_|    |_|  \_\
    BaseREPR
    v1.0.3                                        


    Made by REPR ----- January 28-31, 2025

    This script has two modes--CMD and WEB.
    CMD is for use with NodeJS in the terminal and WEB is for use on the web.

    To enable CMD for execution with NodeJS:
    - Uncomment the "prompt-sync" line below
    - Uncomment the "enactPromptsCMD()" line at the bottom of the file

    To enable WEB for execution as an HTML <script> tag:
    - Uncomment the "WEB ONLY" section at the bottom of the file

*/

// CMD ONLY
// let prompt = require("prompt-sync")();

(() => {

let ogS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._+!'(%,$/:=*;)?<>@&^%|[]{} `#\\~\t\n"; // Base 97
let s;

function strToIntBasic(str) {
    let arr = [];
    for(let i = 0; i < str.length; i++) {
        arr.push(ogS.indexOf(str[i]));
    }
   
    return Number(arr.join(""));
}
async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}
async function keyToInt(key) {
    let keySHA = await sha256(key);
   
    let count = 0;
    for(let i = 0; i < keySHA.length; i++) {
        count += ogS.indexOf(keySHA[i]) * (i ** 21);
    }
   
    count = strToIntBasic(key) - Math.round(Math.log(count) * (count ** 2));
    count = Math.abs(count);
   
    let targetDigits = 16;
    if(count.length < targetDigits) {
        let placeDiff = targetDigits - count.length;
        count *= (5 * targetDigits * placeDiff);
    }
   
    count = String(count);
    if(key.length % 2 === 0) {
        count = count.split("").reverse().join("");
    }
   
    count = Number(count.replace(/[\.e\+]/g, "").slice(count.length - (targetDigits + 1), count.length - 1));
   
    return count;
}
async function setupSWithKey(keyText) {
    const startSArr = ogS.split("");
    const k = await keyToInt(keyText);
    
    for(let i = 0; i < startSArr.length; i++) {
        let timesToShift = (i * k) % startSArr.length;
    
        let elm = startSArr.splice(i, 1)[0];
        startSArr.splice(i + timesToShift, 0, elm);
    }

    for(let i = startSArr.length; i > 0; i--) {
        let timesToShift = (i * k) % startSArr.length;
    
        let elm = startSArr.splice(i, 1)[0];
        startSArr.splice(i + timesToShift, 0, elm);
    }
    
    if((keyText.length % 2) === 0) startSArr.reverse();
    
    return startSArr.join("");
}

function plaintextToCiphertext(plaintxt) {
    let ptArr = plaintxt.split("").reverse();
    let newArr = [];
    
    for(let i = 0; i < ptArr.length; i++) {
        newArr.push(s[ogS.indexOf(ptArr[i])]);
    }
    
    return btoa(newArr.join(""));
}
function ciphertextToPlaintext(ciphertxt) {
    ciphertxt = atob(ciphertxt);
    let ctArr = ciphertxt.split("");
    
    for(let i = 0; i < ctArr.length; i++) {
        ctArr[i] = ogS[s.indexOf(ctArr[i])];
    }
    
    return ctArr.reverse().join("");
}

async function enactPromptsCMD() {
    let mode = prompt("Would you like to ENCODE (type \"e\") or DECODE (type \"d\")? > ");
    if(mode === "e") {
        let plaintext = prompt("Text to encode? > ");
        let key = prompt("Encryption key? (only you and the recipient should know this) > ");
        
        s = await setupSWithKey(key);

        let ciphertext = plaintextToCiphertext(plaintext);

        console.log(
            `\n----- ENCRYPTION RESULT -----\n\nCiphertext: ${ciphertext}\nPlaintext: ${plaintext}\nKey: ${key}\n`
        );
    }
    else if(mode === "d") {
        let ciphertext = prompt("Text to decode? (take care to get everything correct) > ");
        let key = prompt("Decryption key? > ");

        s = await setupSWithKey(key);

        let plaintext = ciphertextToPlaintext(ciphertext);

        console.log(
            `\n----- DECRYPTION RESULT -----\n\nPlaintext: ${plaintext}\nCiphertext: ${ciphertext}\nKey Used: ${key}\n`
        );
    }
    else {
        console.log("Invalid response. Must type \"e\" or \"d\".\n");
    }
}

// WEB ONLY
(() => {
    let modalText = document.querySelector("#modalText");
    let input = document.querySelector("input");
    let form = document.querySelector("form#userForm");

    modalText.innerText = "Would you like to ENCODE (type \"e\") or DECODE (type \"d\")? >";

    let textFromUserToEncodeOrDecode;

    form.addEventListener("submit", e => {
        e.preventDefault();

        switch(modalText.innerText) {
            case "Would you like to ENCODE (type \"e\") or DECODE (type \"d\")? >":
                if(input.value === "e") {
                    modalText.innerText = "Text to encode? >";
                    input.value = "";

                    break;
                }
                if(input.value === "d") {
                    modalText.innerText = "Text to decode? (take care to get everything correct) >";
                    input.value = "";

                    break;
                }
                else {
                    alert("Invalid response. Must type \"e\" or \"d\".");
                    location.reload();

                    break;
                }
                break;
            case "Text to encode? >":
                textFromUserToEncodeOrDecode = input.value;
                modalText.innerText = "Encryption key? (only you and the recipient should know this) >";
                input.value = "";
                
                break;
            case "Text to decode? (take care to get everything correct) >":
                textFromUserToEncodeOrDecode = input.value;
                modalText.innerText = "Decryption key? >";
                input.value = "";
                
                break;
            case "Encryption key? (only you and the recipient should know this) >":
                let eKey = input.value;
                setupSWithKey(eKey).then(sOut => {
                    s = sOut;
                    let ciphertext = plaintextToCiphertext(textFromUserToEncodeOrDecode);
                    navigator.clipboard.writeText(ciphertext);

                    alert(
                        `----- ENCRYPTION RESULT -----\n\nCiphertext: ${ciphertext}\nPlaintext: ${textFromUserToEncodeOrDecode}\nKey: ${eKey}\n\nCiphertext copied to clipboard.`
                    );

                    location.reload();
                });
                
                break;
            case "Decryption key? >":
                let dKey = input.value;
                setupSWithKey(dKey).then(sOut => {
                    s = sOut;
                    let plaintext = ciphertextToPlaintext(textFromUserToEncodeOrDecode);
                    navigator.clipboard.writeText(plaintext);

                    alert(
                        `----- DECRYPTION RESULT -----\n\nPlaintext: ${plaintext}\nCiphertext: ${textFromUserToEncodeOrDecode}\nKey Used: ${dKey}\n\nPlaintext copied to clipboard.`
                    );

                    location.reload();
                });

                break;
        }
    });

    input.focus();
})();

// CMD ONLY
// enactPromptsCMD();

})();