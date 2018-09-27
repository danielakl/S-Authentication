"use strict";

const crypto = require("crypto");
const fs = require('fs');

crypto.randomBytes(48, (err, secret) => {
    secret = secret.toString("hex");
    const data = `SECRET_TOKEN=${secret}`;
    fs.writeFile("./.env", data, "utf8", err => {
        if (err) {
            throw err;
        }
        console.log("Generated '.env' file.");
    });
});