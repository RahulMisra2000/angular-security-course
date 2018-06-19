import {Component, OnInit} from '@angular/core';
import {AuthService} from "./services/auth.service";
import {Observable} from "rxjs";
import {User} from "./model/user";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit {

    isLoggedIn$: Observable<boolean>;
    isLoggedOut$: Observable<boolean>;
    user$: Observable<User>;

    constructor(private authService:AuthService) {

    }

    ngOnInit() {
      
        // Assigning the Observables defined in the Service to local variables here in the component
        // so that this component and also its template (.html) will know when/what values are being emitted (.next()) in the observable 
        // so they can make decisions based on it
        this.isLoggedIn$  = this.authService.isLoggedIn$;
        this.isLoggedOut$ = this.authService.isLoggedOut$;
        this.user$        = this.authService.user$;
    }

    logout() {

        this.authService.logout().subscribe();

    }

}

