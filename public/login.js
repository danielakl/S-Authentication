var form = document.querySelector("#loginForm");
var usernameInput = document.querySelector("#usernameInput");
var passwordInput = document.querySelector("#passwordInput");
var body = document.querySelector("body");
var salt = CryptoJS.lib.WordArray.random(128/8);
console.log(salt);

form.onsubmit = function(event) {
    event.preventDefault();
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/login", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onload = function (e) {
        if (this.readyState === 4) {
            var response = JSON.parse(this.responseText);
            if (this.status === 200) {
                body.innerHTML = response.message;
                console.log(response.message);
            } else {
                body.innerHTML = response.message;
                console.error(response.message);
            }
        }
    };
    xhr.onerror = function (e) {
        var response = JSON.parse(this.responseText);
        body.innerHTML = response.message;
        console.error(response.message);
    };
    xhr.send(JSON.stringify({
        username: usernameInput.value,
        hash: CryptoJS.PBKDF2(passwordInput.value, salt, { keySize: 512/32, iterations: 1000 })
    }));

    console.log(usernameInput.value);
    console.log(CryptoJS.PBKDF2(passwordInput.value, salt, { keySize: 512/32, iterations: 1000 }));
};