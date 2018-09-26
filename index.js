"use strict";

const express = require("express");
const path = require("path");
const crypto = require("crypto");
// const mysql = require("mysql2/promise");
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Connect to MySQL database.
// let dbConn;
// mysql.createConnection({host: 'localhost', user: 'root', database: 'auth'})
//     .then(connection => {
//         dbConn = connection;
//         console.log("Connected to MySQL server.")
//     }).catch(() => {
//         console.error("Failed to connect to MySQL server.")
//     });


// Index route
app.get("/", (req, res) => {
    if (true){
        res.sendFile(path.join(__dirname, "views", "index.html"));
    } else {
        res.sendFile(path.join(__dirname, "views", "home.html"));
    }
});

// Login route
app.post("/login", (req, res) => {
    const {username, hash} = req.body;
    console.log(`Username: ${username}\nHash: ${hash}`);
    if (!username || !hash) {
        res.status(400).json({
            code: 400,
            status: "Bad Request",
            message: "Missing username or password."
        });
    } else {
        let users = JSON.parse(fs.readFileSync("./user.json", "UTF-8"));

        users.forEach((el) => {
            console.log("else username:" + el.username);
            if (el.username === username){
                let salt = el.salt;
                let hash2 = crypto.pbkdf2Sync(hash, salt, 2048, 512/32, "sha256").toString("hex");
                console.log(el.hash);
                console.log(hash2);
                if (hash2 === el.hash){
                    return res.json({
                        code: 200,
                        status: "OK",
                        message: "Authorization succeeded."
                    });
                }
            }
        });
        res.status(401).json({
            code: 401,
            status: "Unauthorized",
            message: "Username or password is wrong."
        });
    }
});

// Server 404 page for any unhandled routes.
app.use("*", (req, res) => {
    res.status(404).send("Not Found.");
});

// Start up server listening to requests made to an IP and port.
const server = app.listen(process.env.PORT | 3000, process.env.IP | "localhost", () => {
    const {address, port} = server.address();
    console.log(`Authentication server listening to request made to 'http://${(address === '::') ? "localhost" : address}:${port}'`);
});
