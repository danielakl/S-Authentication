"use strict";

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2");

const server = express();
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());

let dbConn;
try {
    dbConn = mysql.createConnection({host: 'localhost', user: 'root', database: 'auth'});
} catch (e) {
    console.error(e);
}

server.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

server.post("/login", (req, res) => {
    const {username, hash} = req.body;
    console.dir(req.body);
    console.log(`Username: ${username}\nHash: ${hash}`);
    if (!username || !hash) {
        res.status(400).json({
            code: 400,
            status: "Bad Request",
            message: "Username and password needed."
        });
    } else {
        if (dbConn) {

        }
    }
});

server.use("*", (req, res) => {
    res.status(404).send("Not Found.");
});

server.listen(process.env.PORT | 3000, process.env.IP | "localhost", () => {
    console.log(`Authentication server listening to request made to 'http://localhost' at port '3000'`);
});
