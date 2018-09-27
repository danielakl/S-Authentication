var form = document.querySelector("#loginForm");
var usernameInput = document.querySelector("#usernameInput");
var passwordInput = document.querySelector("#passwordInput");
var body = document.querySelector("body");

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
                localStorage.setItem('token', `Bearer ${response.token}`);
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
        password: CryptoJS.PBKDF2(passwordInput.value, usernameInput.value, { keySize: 16, iterations: 1000 }).toString()
    }));

    console.log("Username: " + usernameInput.value);
    console.log("Hash: " + CryptoJS.PBKDF2(passwordInput.value, usernameInput.value, { keySize: 16, iterations: 1000 }).toString());
};