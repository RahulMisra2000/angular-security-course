import {Request, Response} from 'express';

export function logout(req: Request, res: Response) {
    res.clearCookie("SESSIONID");                           // Delete the cookie
    res.clearCookie("XSRF-TOKEN");                          // Delete the cookie
    res.sendStatus(200);
}
