"use strict";

require("dotenv").config();
const express = require("express");
const https = require('https');
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(cookieParser(process.env.SECRET_COOKIE));

// Middleware function to secure home area.
function verifyToken(req, res, next) {
    console.log('Signed Cookies: ', req.signedCookies);
    const bearerHeader = req.headers.authorization || req.signedCookies.token;

    if (bearerHeader) {
        const bearerToken = bearerHeader.split(' ')[1];
        jwt.verify(bearerToken, process.env.SECRET_TOKEN, (err, authData) => {
            if (err) {
                console.error("Invalid access token.");
                res.redirect("/");
            } else {
                console.log("Valid access token.");
                req.user = authData;
                next();
            }
        });
    } else {
        console.error("No access token provided.");
        res.redirect("/");
    }
}

let sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "localhost.key")),
    cert: fs.readFileSync(path.join(__dirname, "localhost.cert")),
    requestCert: false,
    rejectUnauthorized: false
};

// Index route.
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Protected home area.
app.get("/home", verifyToken, (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
});

// Login route
app.post("/login", (req, res) => {
    const {username, password} = req.body;
    console.log(`Username from client: ${username}\nHash from client:\t\t${password}`);
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
                console.log(`Login salt:\t\t\t${user.salt.toString("hex")}`);
                crypto.pbkdf2(password, user.salt.toString("hex"), 100000, 64, "sha512", (err, hash) => {
                    if (err) {
                        throw err;
                    }
                    console.log(`Hash from database:\t\t${user.hash}`);
                    console.log(`Hash generated on server:\t${hash.toString("hex")}`);
                    if (user.hash === hash.toString("hex")) {
                        // ExpiresIn: Short lived is more secure.
                        jwt.sign({username}, process.env.SECRET_TOKEN, {expiresIn: '1h'}, (err, token) => {
                            if (err) {
                                console.error(`Error signing JWT\n${err}`);
                                return res.status(500).json({
                                    code: 500,
                                    status: "Internal server error",
                                    message: "Failed to create access token."
                                });
                            }
                            // MaxAge: No longer than token lifetime, for better security.
                            // Secure: Instructs browser to only send the cookie over HTTPS connection.
                            // HttpOnly: Only accessible over HTTP/HTTPS, not accessible through client side javascript.
                            res.cookie("token", `Bearer ${token}`, {maxAge: 60 * 60, secure: true, httpOnly: true, signed: true});
                            console.log(`Token: ${token}`);
                            return res.json({
                                code: 200,
                                status: "OK",
                                message: "Authorization succeeded.",
                                token: `Bearer ${token}`
                            });
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
const server = https.createServer(sslOptions, app).listen(process.env.PORT | 443, process.env.IP | "localhost", () => {
    const {address, port} = server.address();
    console.log(`Authentication server listening to request made to 'https://${(address === '::') ? "localhost" : address}:${port}'`);
});

// Redirect http to https
// TODO: Maybe?
