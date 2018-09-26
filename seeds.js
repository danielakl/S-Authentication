"use strict";

const crypto = require("crypto");
const fs = require('fs');


let users = [{
        username: "kristian",
        password: "123456"
    }, {
        username: "kristoffer",
        password: "xx666666xx"
    }, {
        username: "roy",
        password: "hallo"
    }, {
        username: "daniel",
        password: "hunter2"
    }
];

users = users.map(user => {
    const {username, password} = user;
    const hash = crypto.pbkdf2Sync(password, username, 1000, 16, "sha1");
    const salt = crypto.randomBytes(16);
    // console.log(hash.toString("hex"));
    return {
        username,
        salt: salt.toString('hex'),
        hash: crypto.pbkdf2Sync(hash, salt, 100000, 64, "sha512").toString("hex")
    }
});

// console.log(users);
fs.writeFile("./user.json", JSON.stringify(users), "utf8", err => {
    if (err) {
        throw err;
    }
    console.log("Generated 'user.json' file.");
});
