import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

// *********** We are using the auth0-js javascript library to talk to Auth0
import * as auth0 from 'auth0-js';

import {Router} from "@angular/router";
import * as moment from "moment";
import {User} from "../model/user";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


// Get this information from the Auth0 portal after creating a new Application on the Portal
// The word Application above is NOT a code application as we know it ... It is just a concept in Auth0
const AUTH_CONFIG = {
    clientID: '2rfnGSUN3BRd2Bg3MLY3IPCWbQhxR7bG',     // This will be the value of aud: claim inside the token
    domain: "angularuniv-security-course.auth0.com"   // This will be the value of iss: claim inside the token
};


@Injectable()
export class AuthService {

    // ***** auth0 exposes the Auth0 APIs to our code ... Through this we access the world of Auth0
    auth0 = new auth0.WebAuth({
        clientID: AUTH_CONFIG.clientID,
        domain: AUTH_CONFIG.domain,
        // token    : we are asking Auth0 to return the Access Token after successful authentication
        // id_token : we are asking Auth0 to return the Identity Token after successful authentication
        responseType: 'token id_token',
        // we are asking Auth0 to redirect the user's browser to the provided url after authentication
        redirectUri: 'https://localhost:4200/lessons',   
      
        // scope: We are asking Auth0 WHICH claims it should stuff inside the Identity Token payload
        // openid : means these claims --- iss, iat, aud, exp claims 
        // email  : means the email
        scope: 'openid email' 
    });

    private subject = new BehaviorSubject<User>(undefined);
    user$: Observable<User> = this.subject.asObservable().filter(user => !!undefined);

    constructor(private http: HttpClient, private router: Router) {
        if (this.isLoggedIn()) {
            this.userInfo();
        }
    }

    login() {
        // If using Universal Login, which is the default, this will redirect our Angular Application to Auth0's login screen
        // and after a successful entry of username/pwd, Auth0 will redirect to the url we specify as the callback url. This needs to be
        // specified BOTH at the Auth0 portal and also in our code (see redirectUri : property above)
      
        // auth0 is a javascript library provided by Auth0
        this.auth0.authorize({initialScreen:'login'});        // This API shows the login
    }

    signUp() {
        // auth0 is a javascript library provided by Auth0
        this.auth0.authorize({initialScreen:'signUp'});       // This API shows the signup
    }

    // Our callback url page should call this method.
    // In our example, the callback url we have told Auth0 about it https://localhost:4200/lessons
    // So, whichever Angular component that is, in its ngOnInit we should call the method below
    retrieveAuthInfoFromUrl() {  
        // Auth0 after authenticating, creates token(s) and places them after the # symbol in the callback url we specify to Auth0
        // In our example since we have requested the Idenity Token and Access Token, we will be receiving both
        // This method .parseHash() reads the address bar and populates the 2nd parameter (authResult) with it so, we can access it
        this.auth0.parseHash((err, authResult) => {   // authResult is the javascript object created for us and it contains the stuff after the #
            if (err) {
                console.log("Could not parse the hash", err);
            }
            else if (authResult && authResult.idToken) {
                // Erase the # and beyond in the address bar because we have already used that information and so we want the url to 
                // look clean
                window.location.hash = '';                           
                console.log("Authentication successful, authResult: ", authResult);
                // Add 
                this.setSession(authResult);                               // add jwt Identity Token and expiry info to localStorage

                this.userInfo();

            }
        });
    }

    userInfo() {
        this.http.put<User>('/api/userinfo', null)
            .shareReplay()
            .do(user => this.subject.next(user))
            .subscribe();   // Unless someone does a subscribe the http request won't go out... that is just how Observables work ...
            // The /api/userinfo is an EndPoint on the Resource Server that returns "stuff" about the user (eg the email address) 
            // inside the jwt
            // You might think that since we have the jwt in localStorage why doesn't the Angular application extract the payload 
            // from it and get to the email address
            // The reason is that the Resource Server is already doing the verification of the jwt that it receives in the http header 
            // so, it is a better design to let that processing happen in one place ... and the Resource Server offers an EndPoint 
            // that we can call to get the email address or for that matter anything out of the jwt
    }

    logout() {
        localStorage.removeItem("id_token");
        localStorage.removeItem("expires_at");
        this.router.navigate(['/lessons']);
    }

    // Just checks if at THIS VERY moment, the jwt token in the localStorage has expired or not
    public isLoggedIn() {
        return moment().isBefore(this.getExpiration());
    }

    isLoggedOut() {
        return !this.isLoggedIn();
    }

    getExpiration() {
        const expiration = localStorage.getItem("expires_at");
        const expiresAt = JSON.parse(expiration);
        return moment(expiresAt);
    }

    // SAVE the JWT token and its expiry info in localStorage
    // If you console.log the authResult .. you will see the object structure and you will know which property has the jwt token
    // etc... Auth0 places the jwt token in idToken property... so that is how we access it ...
    // Also, in that object you will find expireIn property .....
    private setSession(authResult) {
        const expiresAt = moment().add(authResult.expiresIn,'second');
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem("expires_at", JSON.stringify(expiresAt.valueOf()) );

    }
}







