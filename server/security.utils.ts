import moment = require("moment");
const util = require('util');
const crypto = require('crypto');
import * as jwt from 'jsonwebtoken';
import * as fs from "fs";
import * as argon2 from 'argon2';
import {DbUser} from "./db-user";


export const randomBytes = util.promisify(crypto.randomBytes);

export const signJwt = util.promisify(jwt.sign);
const RSA_PRIVATE_KEY = fs.readFileSync('./demos/private.key');
const RSA_PUBLIC_KEY = fs.readFileSync('./demos/public.key');
const SESSION_DURATION = 1000;


// Creates the JWT token and shoves the user id in its PAYLOAD in a property called subject:
export async function createSessionToken(user: DbUser) {
    return signJwt({},            
        RSA_PRIVATE_KEY, {
        algorithm: 'RS256',      
        expiresIn: 7200,
        subject: user.id.toString()
    });
}

// Makes sure that the JWT token is kosher and then extracts the payload out of it and returns it to the caller
export async function decodeJwt(token:string) {
    const payload = await jwt.verify(token, RSA_PUBLIC_KEY);
    console.log("decoded JWT payload", payload);
    return payload;
}

export async function createCsrfToken() {
    return await randomBytes(32).then(bytes => bytes.toString("hex"));
}
