import * as express from 'express';
import {Application} from "express";
import * as fs from 'fs';
import * as https from 'https';
import {readAllLessons} from "./read-all-lessons.route";
import {userInfo} from "./user-info.route";
const bodyParser = require('body-parser');

// These javascript libraries provide API that help us verify the JWT Token that the front-end Angular 
// application sends to this Resource Server
const jwksRsa = require('jwks-rsa');
const jwt = require('express-jwt');


const app: Application = express();

app.use(bodyParser.json());

// Command-line arguments receinged by this Resource Server when it starts up
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'secure', type: Boolean,  defaultOption: true },
];
const options = commandLineArgs(optionDefinitions);


// This CREATES a MIDDLEWARE that extracts the jwt token from this Http Header -> Authorization: Bearer <jwt token>
// and then verifies it for kosherness ...
// ******* If it passes verification then it adds the payload in the jwt to the Http Request Object's .user property so downstreamers have access to it
//         If it failes verification then it creates an err object whose name property is assigned "UnauthorizedError"
const checkIfAuthenticated = jwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        // Here we are pointing to the EndPoint address that will get us the Public Key. 
        // This Endpoint address is on the Auth0 Portal under Application/Settings/Advanced Settings/End Points Tab
        jwksUri: "https://angularuniv-security-course.auth0.com/.well-known/jwks.json"
    }),
    algorithms: ['RS256']
});

// Plugging the Middleware in the pipeline
app.use(checkIfAuthenticated);

// We are writing our own Middleware to check the results of the above Middleware to see if JWT verification passed or not
// The reason for this design pattern is that the above middleware CANNOT know how an application that uses that middleware wants to
// do when jwt verification fails...SO, it just creates and populates the err object so our code can access it and decide what to do
app.use((err, req, res, next) => {
    if (err && err.name == "UnauthorizedError") {
        res.status(err.status).json({message: err.message});
    }
    else {
        next();
    }
});

// EXECUTION will reach this point ONLY if the jwt was verified. Which means everything below this is only available to 
// authenticated users

// REST API
app.route('/api/lessons').get(readAllLessons);
app.route('/api/userinfo').put(userInfo);


if (options.secure) {
    const httpsServer = https.createServer({
        key: fs.readFileSync('key.pem'),
        cert: fs.readFileSync('cert.pem')
    }, app);

    // launch an HTTPS Server. Note: this does NOT mean that the application is secure
    httpsServer.listen(9000, () => console.log("HTTPS Secure Server running at https://localhost:" + httpsServer.address().port));

}
else {

    // launch an HTTP Server
    const httpServer = app.listen(9000, () => {
        console.log("HTTP Server running at https://localhost:" + httpServer.address().port);
    });

}

