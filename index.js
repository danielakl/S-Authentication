"use strict";

import express from "express";
import bodyParser from "body-parser";
import path from "path";
import crypto from "crypto";
import mysql from "mysql2";

const server = express();
server.use(express.static(path.join(__dirname, "public")));
server.use(bodyParser.urlencoded({extended: true}));

const dbConn = mysql.createConnection({host: 'localhost', user: 'root', database: 'auth'})
    .then(() => {
        console.log("Connected to MySQL server.");
    }).catch(() => {
        console.error("Failed to connect to MySQL server.");
    });

server.get("/", (req, res) => {
    res.sendFile("./views/index.html");
});

server.post("/login", (req, res) => {
    const {username, hash} = req.body;
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
    console.log(`Authentication server listening to request made to 'http://${server.address().address}' at port '${server.address().port}'`);
});