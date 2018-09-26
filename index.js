"use strict";

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const mysql = require("mysql2");
const fs = require('fs');

const server = express();
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());

/*let dbConn;
try {
dbConn = mysql.createConnection({host: 'localhost', user: 'root', database: 'auth'});
} catch (e) {
console.error(e);
}
*/

server.get("/", (req, res) => {


  if (true){
    res.sendFile(path.join(__dirname, "views", "index.html"));
  } else {
    res.sendFile(path.join(__dirname, "views", "home.html"));
  }
});

server.post("/login", (req, res) => {
  const {username, hash} = req.body;
  //console.dir(req.body);
  console.log(`Username: ${username}\nHash: ${hash}`);
  if (!username || !hash) {
    res.status(400).json({
      code: 400,
      status: "Bad Request",
      message: "Username and password needed."
    });
    return;
  } else {
    var users = JSON.parse(fs.readFileSync("./user.json", "UTF-8"));

    users.forEach(function(el){
      console.log("else username:" + el.username);
      if (el.username === username){
        var salt = el.salt;
        var hash2 = crypto.pbkdf2Sync(hash, salt, 2048, 512/32, "sha256").toString("hex");
        console.log(el.hash);
        console.log(hash2);
        if (hash2 === el.hash){
          return res.json({"loggedIn": "YES"});
        }

      }
    })

    res.status(404).json({
      code:404,
      status: "Password or username is wrong",
      message: "Bad password/username"
    });


  }
});

server.use("*", (req, res) => {
  res.status(404).send("Not Found.");
});

server.listen(process.env.PORT | 3000, process.env.IP | "localhost", () => {
  console.log(`Authentication server listening to request made to 'http://localhost' at port '3000'`);
});
