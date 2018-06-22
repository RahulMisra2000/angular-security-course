import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as auth0 from 'auth0-js';
import {Router} from "@angular/router";
import * as moment from "moment";
import {User} from "../model/user";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


// Get this information from the Auth0 portal after signing up with them
const AUTH_CONFIG = {
    clientID: '2rfnGSUN3BRd2Bg3MLY3IPCWbQhxR7bG',
    domain: "angularuniv-security-course.auth0.com"   // we get to choose the sub-domain
};


@Injectable()
export class AuthService {

    // Our code talks to Auth0 Service using this object.
    auth0 = new auth0.WebAuth({
        clientID: AUTH_CONFIG.clientID,
        domain: AUTH_CONFIG.domain,
        responseType: 'token id_token',                   // After Auth0 authenticates credentials, please send us the jwt token
        redirectUri: 'https://localhost:4200/lessons',    // After Auth0 authenticates this is where it will redirect into our SPA
        scope: 'openid email'                             // we want Auth0 to stuff the email in the jwt
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
        this.auth0.authorize({initialScreen:'login'});
    }

    signUp() {
        // auth0 is a javascript library provided by Auth0
        this.auth0.authorize({initialScreen:'signUp'});
    }

  
    retrieveAuthInfoFromUrl() {  
        // Auth0 after authenticating, creates jwt token and places it after the # symbol in the callback url we specify to Auth0
        // This method .parseHash() reads the address bar and populates the 2nd parameter (authResult) with it so, we can access it
        this.auth0.parseHash((err, authResult) => {
            if (err) {
                console.log("Could not parse the hash", err);
            }
            else if (authResult && authResult.idToken) {
                window.location.hash = '';                                            // Erase the # and beyond in the address bar
                console.log("Authentication successful, authResult: ", authResult);
                this.setSession(authResult);                                          // add jwt token and expiry info to localStorage

                this.userInfo();

            }
        });
    }

    userInfo() {
        this.http.put<User>('/api/userinfo', null)
            .shareReplay()
            .do(user => this.subject.next(user))
            .subscribe();   // Unless someone does a subscribe the http request won't go out... that is just how Observables work ...
            // The /api/userinfo is an EndPoint on the Resource Server that returns the email address inside the jwt
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







