import {Request, Response} from "express";
import {db} from "./database";


// This function adds the user to OUR DATABASE (remember the user is already in Auth0's database)
// and then returns the user's email address 
export function userInfo(req:Request, res:Response) {
    // The Http Request Object's user property is filled by the jwt payload by the Middleware
    const userInfo = req.user;

    console.log("Checking if user exists", userInfo);
    let user = db.findUserByEmail(userInfo.email);
    if (!user) {
        user = db.createUser(userInfo.email,userInfo.sub);
    }

    res.status(200).json({email:user.email});

}

