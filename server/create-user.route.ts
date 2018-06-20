
import {Request, Response} from "express";
import {db} from "./database";
import * as argon2 from 'argon2';
import {validatePassword} from "./password-validation";
import moment = require("moment");
import {createCsrfToken, createSessionToken} from "./security.utils";

export function createUser(req: Request, res:Response) {
    const credentials = req.body;
    const errors = validatePassword(credentials.password);                // Make sure the password follows certain rules

    if (errors.length > 0) {
        res.status(400).json({errors});
    }
    else {
        createUserAndCookies(res, credentials)
                                        .catch((err) => {
                                        console.log("Error creating new user", err);
                                        res.sendStatus(500);
        });
    }
}

async function createUserAndCookies(res:Response, credentials) {
    const passwordDigest  = await argon2.hash(credentials.password);     
    const user            = db.createUser(credentials.email, passwordDigest);
    const sessionToken    = await createSessionToken(user);                  // create jwt token and shove user info in its payload
    const csrfToken       = await createCsrfToken();                         // create a random token

    // Create a cookied called SESSSIONID (can be any name) 
    // We don't want javascript on the client-side to have any access (think document.cookie) to this cookie - hence httpOnly:true
    res.cookie("SESSIONID", sessionToken, {httpOnly:true, secure:true});  // create a cookie and shove the jwt inside
  
    // We want this cookie's content to be accessible by client-side javascript so we can ask Angular HttpClientXsrfModule to 
    // read its contents and shove it in the Http Header (I think internally it does it using Http Interceptor)
    // That is why we don't say HttpOnly: true ... and so the default of false is applied
    res.cookie("XSRF-TOKEN", csrfToken);
    res.status(200).json({id:user.id, email:user.email, roles: user.roles});
}
