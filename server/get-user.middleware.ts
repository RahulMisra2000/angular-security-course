import {decodeJwt} from "./security.utils";
import {Request, Response, NextFunction} from 'express';

// This MIDDLEWARE basically pulls out the jwt token from inside a cookie called SESSIONID (if this cookie exists in the http request)
// and creates a property on the http request object (and populates it with the payload from the jwt token).
// So, anything downstream in the processing of this http request will have access to this payload information.
export function retrieveUserIdFromRequest(req: Request, res: Response, next: NextFunction) {
    // See if there is a cookie called SESSIONID riding with the http request
    const jwt = req.cookies["SESSIONID"];

    if (jwt) {
        handleSessionCookie(jwt, req)
            .then(() => next())
            .catch(err => {
                console.error(err);
                next();
        })
    }
    else {
      next();
    }
}

async function handleSessionCookie(jwt:string, req: Request) {
    try {
        const payload = await decodeJwt(jwt);
        // The programmer decided to create a property called user ... he could have called it 'x'
        // and then anything downstream (during the http request processing) can access the payload by way of this property
        req["user"] = payload;
    }
    catch(err) {
        console.log("Error: Could not extract user from request:", err.message);
    }
}
