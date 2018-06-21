
import {shareReplay, filter, tap, map} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, BehaviorSubject} from "rxjs";
import {User} from "../model/user";


export const ANONYMOUS_USER: User = {
    id: undefined,
    email: undefined,
    roles: []
}


@Injectable()
export class AuthService {

// CREATE SOME OBSERVABLES
  // The <User> says that the shape of data that will be placed in the stream will adhere to User Interface or Class
  // Right off the bat undefined is placed in the stream created by BehaviorSubject
    private subject = new BehaviorSubject<User>(undefined);

    // Stuff from the subject stream will find its way into the user$ observable stream provided the stuff
    // resolves to truthy. That is what the filter() is doing ...
    // So, the undefined that we placed in the observable stream will fail the filter defined below and the undefined will NOT
    // be placed in the user$ observable stream.
    user$: Observable<User> = this.subject.asObservable().pipe(filter(user => !!user));

// Components and their templates can subscribe to these observables to know if the user is logged in or not
    isLoggedIn$: Observable<boolean> = this.user$.pipe(map(user => !!user.id));
    isLoggedOut$: Observable<boolean> = this.isLoggedIn$.pipe(map(isLoggedIn => !isLoggedIn));

  

  // ********* The AppComponent (bootstrap component) DIs this service so an instance of this service is created and given to the 
  // AppComponent. And since this service is registered with the AppModule, it is a singleton.
  // Which means the constructor gets executed before even the AppComponent is rendered .... and that is why in the constructor 
  // we call the /api/user Web API endpoint because it returns the user record ... whose userid is inside the jwt token which is 
  // inside the cookie.... The middleware on the Web API server unravels the cookie and extracts the userid from inside the jwt token 
  // which is inside the cookie ... This userid is used to find the user corresponding to the userid. That user is returned here ...
  // of course it will be returned provided the cookie exists ... the jwt inside it is kosher ... the userid inside the jwt payload
  // exists and using it we are able to access the user record from the database .... if there is any problem in this chain then
  // the endpoint returns undefined for the user .... and that is why we emit (next()) an ANONYMOUS user in that case ....
  // THE POINT IS .... that the Angular Application knows if the user is authenticated or not VERY EARLY ON ....... 
    constructor(private http: HttpClient) {
        http.get<User>('/api/user')
          .pipe(
                tap(console.log)
               )
          .subscribe(user => this.subject.next(user ? user : ANONYMOUS_USER));
    }

    signUp(email:string, password:string ) {

        return this.http.post<User>('/api/signup', {email, password}).pipe(
            shareReplay(),
            tap(user => this.subject.next(user)),);
    }

    login(email:string, password:string ) {
        return this.http.post<User>('/api/login', {email, password}).pipe(
            shareReplay(),
            tap(user => this.subject.next(user)),);
    }

    loginAsUser(email:string) {
        return this.http.post<User>('/api/admin', {email}).pipe(
            shareReplay(),
            tap(user => this.subject.next(user)),);
    }

    logout() : Observable<any> {
        return this.http.post('/api/logout', null).pipe(
            shareReplay(),
            tap(user => this.subject.next(ANONYMOUS_USER)),);
    }
}








