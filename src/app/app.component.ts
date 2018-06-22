import {Component, OnInit} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {Observable} from "rxjs/Observable";
import {User} from "./model/user";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {

    constructor(private auth:AuthService) {

    }

    ngOnInit() {
        // This is called here because 
        // On successful authentication, Auth0 redirects the browser BACK to our Angular Application at a URL (called callback url) 
        // (that we provided to the Auth0 portal) with the jwt token as a url hash segment
        // Because our Angular Application is redirected to … it is like starting up Angular Application … so in the Bootstrap 
        // Component’s ngOnInit we read the hash segment and save the jwt and its expiry in localStorage
        this.auth.retrieveAuthInfoFromUrl();
    }

    signUp() {
        this.auth.signUp();
    }

    login() {
        this.auth.login();

    }

    logout() {
        this.auth.logout();
    }

}

