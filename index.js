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
    console.log(`Username from client: ${username}\nHash from client: ${hash}`);
    if (!username || !hash) {
        res.status(400).json({
            code: 400,
            status: "Bad Request",
            message: "Missing username or password."
        });
    } else {
        fs.readFile(path.join(__dirname, "user.json"), {encoding: "utf8"}, (err, users) => {
            if (err) {
                throw err;
            }
            users = JSON.parse(users);
            const user = users.find(element => {
                return element.username === username;
            });
            if (user) {
                crypto.pbkdf2(hash, user.salt, 100000, 64, "sha512", (err, key) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`Hash from database ${user.hash}`);
                    console.log(`Hash generated on server ${key.toString("hex")}`);
                    if (user.hash === key.toString("hex")) {
                        res.json({
                            code: 200,
                            status: "OK",
                            message: "Authorization succeeded."
                        });
                    } else {
                        res.status(401).json({
                            code: 401,
                            status: "Unauthorized",
                            message: "Username or password is wrong."
                        });
                    }
                });
            } else {
                res.status(401).json({
                    code: 401,
                    status: "Unauthorized",
                    message: "Username or password is wrong."
                });
            }
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
