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
    const {username, password} = req.body;
    console.log(`Username from client: ${username}\nHash from client:\t\t\t${password}`);
    if (!username || !password) {
        return res.status(400).json({
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
                console.log("login salt:" + user.salt.toString("hex"));
                crypto.pbkdf2(password, user.salt.toString("hex"), 100000, 64, "sha512", (err, hash) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`Hash from database:\t\t\t${user.hash}`);
                    console.log(`Hash generated on server:\t${hash.toString("hex")}`);
                    if (user.hash === hash.toString("hex")) {
                        return res.json({
                            code: 200,
                            status: "OK",
                            message: "Authorization succeeded."
                        });
                    } else {
                        return res.status(401).json({
                            code: 401,
                            status: "Unauthorized",
                            message: "Username or password is wrong."
                        });
                    }
                });
            } else {
                return res.status(401).json({
                    code: 401,
                    status: "Unauthorized",
                    message: "Username or password is wrong."
                });
            }
        });
    }
});

// Register form route
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});

// Register logic route
app.post("/register", (req, res) => {
    const {username, password, passwordRepeat} = req.body;
    console.log(`Username from client: ${username}\nHash from client:\t\t\t${password}\nRepeated hash from client:\t${passwordRepeat}`);
    if (!username || !password) {
        return res.status(400).json({
            code: 400,
            status: "Bad Request",
            message: "Missing username or password."
        });
    } else {
        fs.readFile(path.join(__dirname, "user.json"), {encoding: "utf8"}, (err, users) => {
            let user;
            if (err) {
                console.error("Error reading 'user.json' file");
                users = [];
            } else {
                users = JSON.parse(users);
                user = users.find(element => {
                    return element.username === username;
                });
            }
            if (!user) {
                if (password === passwordRepeat) {
                    crypto.randomBytes(16, (err, salt) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Salt from register" + salt.toString("hex"));
                        crypto.pbkdf2(password, salt.toString("hex"), 100000, 64, "sha512", (err, hash) => {
                            if (err) {
                                throw err;
                            }
                            users.push({
                                username,
                                salt: salt.toString("hex"),
                                hash: hash.toString("hex")
                            });
                            fs.writeFile(path.join(__dirname, "user.json"), JSON.stringify(users), "utf8", err => {
                                if (err) {
                                    throw err;
                                }
                                return res.json({
                                    code: 200,
                                    status: "OK",
                                    message: "Successfully created user."
                                });
                            });
                        });
                    });
                } else {
                    return res.status(409).json({
                        code: 409,
                        status: "Conflict",
                        message: "The passwords does not match."
                    });
                }
            } else {
                return res.status(409).json({
                    code: 409,
                    status: "Conflict",
                    message: "There is already a user with that username."
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
