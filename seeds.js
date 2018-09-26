"use strict";

const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require('fs');


var users = [
  {
    "username": "kristian",
    "password": "123456",
    "salt": "HEI",
    "hash": null
  },
  {
    "username": "kristoffer",
    "password": "xx666666xx",
    "salt": "HADE",
    "hash":null
  },
  {
    "username": "roy",
    "password": "hallo",
    "salt": "SYLTHE",
    "hash": null
  },
  {
    "username": "daniel",
    "password": "brabra",
    "salt": "NEI",
    "hash": "null"
  }
]


for (var i = 0; i < users.length; i++){
  var hash1 = crypto.pbkdf2Sync(users[i].password, users[i].username, 1000, 512/32, "sha1");
  console.log(hash1.toString("hex"));
  var hash2 = crypto.pbkdf2Sync(hash1, users[i].salt, 2048, 512/32, "sha256").toString("hex");
  users[i].hash = hash2;

}
console.log(users);
fs.writeFile("./user.json", JSON.stringify(users),"UTF-8", function(){
  console.log("Ferdig");
});
