import {Request, Response, NextFunction} from 'express';

// This middleware STOPS processing the Http Request any further and returns status 403 IF the token in the HTTP Header's 
// x-xsrf-token property is NOT the same as the token inside the cookie.
export function checkCsrfToken(req: Request,  res: Response,  next: NextFunction) {
    const csrfCookie = req.cookies["XSRF-TOKEN"];
    const csrfHeader = req.headers['x-xsrf-token'];

    if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
        next();
    }
    else {
        res.sendStatus(403);
    }
}

