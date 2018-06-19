import {Request, Response, NextFunction} from 'express';

// Another middleware that is placed before this one in the pipeline opens the SESSIONID cookie, extracts the payload from the jwt token
// and assigns it to the HTTP Request object's user property ....... ..  req['user']
// In this application the id of the user is in the payload
// So, if the cookie was not riding with the Http Request or the jwt token in it was not kosher or the payload property we are looking 
// for wasn't there etc then req['user'] will not exist and that would mean that the user (who made the Web API call that lead
// the processing to this middleware) is NOT authenticated ..... So, this middleware returns 403 and since it does not call next(), the 
// processing stops.
export function checkIfAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req['user']) {
        next();
    }
    else {
        res.sendStatus(403);
    }
}
