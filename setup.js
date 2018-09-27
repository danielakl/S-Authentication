"use strict";

const crypto = require("crypto");
const fs = require('fs');

crypto.randomBytes(48, (err, secretToken) => {
    secretToken = secretToken.toString("hex");
    crypto.randomBytes(48, (err, secretCookie) => {
        secretCookie = secretCookie.toString("hex");
        const data = `SECRET_TOKEN=${secretToken}\n` +
                     `SECRET_COOKIE=${secretCookie}`;
        fs.writeFile("./.env", data, "utf8", err => {
            if (err) {
                throw err;
            }
            console.log("Generated '.env' file.");
        });
    });
});