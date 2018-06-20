

import * as express from 'express';
import {Application} from "express";
import * as fs from 'fs';
import * as https from 'https';
import {readAllLessons} from "./read-all-lessons.route";
import {createUser} from "./create-user.route";
import {getUser} from "./get-user.route";
import {logout} from "./logout.route";
import {login} from "./login.route";
import {retrieveUserIdFromRequest} from "./get-user.middleware";
import {checkIfAuthenticated} from "./authentication.middleware";
import {checkCsrfToken} from "./csrf.middleware";

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


const app: Application = express();

// This 3rd party Middleware I THINK attaches all the cookies that have come for a ride with HTTP call to the HTTP request 
// object's cookies property, so it can be accessed by doing req.cookies['name of the cookie']
app.use(cookieParser());

// This is a custom middleware that stuffs user id (which is inside the jwt token which is inside a cookie) into the user property of
// the HTTP Request object so, that anything downstream can have access to the user id
app.use(retrieveUserIdFromRequest);
app.use(bodyParser.json());


const commandLineArgs = require('command-line-args');

// Here we are defining the command line arguments that this server.ts will receive
const optionDefinitions = [
    { name: 'secure', type: Boolean,  defaultOption: true },
];

// The command line arguments will be available to us in options object
const options = commandLineArgs(optionDefinitions);

// REST API ***********************************************************************************************************
app.route('/api/lessons').get(checkIfAuthenticated, readAllLessons);          // Route protected by Middleware
app.route('/api/signup').post(createUser);
app.route('/api/user').get(getUser);
app.route('/api/logout').post(checkIfAuthenticated, checkCsrfToken, logout);  // Route protected by Middleware
app.route('/api/login').post(login);
// REST API ***********************************************************************************************************


// LAUNCH HTTPS Server
if (options.secure) {

    const httpsServer = https.createServer({
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    }, app);

    // launch an HTTPS Server. Note: this does NOT mean that the application is secure
    httpsServer.listen(9000, () => console.log("HTTPS Secure Server running at https://localhost:" + httpsServer.address().port));

}
else {
// LAUNCH HTTP Server    
    const httpServer = app.listen(9000, () => {
        console.log("HTTP Server running at https://localhost:" + httpServer.address().port);
    });

}








