import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { LoginService } from './login.service';
import { catchError, switchMap, finalize, take, filter, map, tap } from "rxjs/operators";
import { NavController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  isRefreshingToken: boolean = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private settings: SettingsService, private loginService: LoginService, private nav: NavController, ) { }

  updateHeaders(req: HttpRequest<any>): HttpRequest<any> {
    return req.clone({
      withCredentials: true,
    })
  }

  // {"status":"error","data":[],"errors":[{"message":"Not Authorized","code":0,"customData":null}]}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(this.updateHeaders(req))
    .pipe(
      map(event => {
        //  debugger;
        if (event instanceof HttpResponse) {
          if (event.body && event.body.status === 'error') {
            if (event.body.errors[0].message === 'Not Authorized') {
              throw new HttpErrorResponse({
                status: 401,
              });
            }

          }
        }
        return event;
      }),
      catchError((error: any) => {
        //  debugger;
        if (error instanceof HttpErrorResponse) {
          switch ((<HttpErrorResponse>error).status) {
            case 400:
              console.log(400);
              //   return this.handle400Error(error);
              break;
            case 401:
              return this.handle401Error(req, next);
              break;
            default:
              console.log('interceptor throwError')
              return throwError(error);
              break;
          }
        } else {
          console.log('interceptor throwError')
          return throwError(error);
        }
      })
    );
  }


  handle401Error(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
   
      this.isRefreshingToken = true;
      this.tokenSubject.next(null);
      return this.loginService.getRefreshToken(this.settings.authToken).pipe( //this.settings.refreshToken
        switchMap((response: any) => {
          if (response && response.status === 'error' && response.errors[0].message === 'Invalid token id') {
            // debugger;
            this.nav.navigateRoot("/login");
            return throwError('');
          }
          // debugger;
          let sessionId = response.data.PHPSESSID;
          //this.settings.refreshToken = sessionId;

          this.tokenSubject.next(sessionId); // why token
          return next.handle(this.updateHeaders(req));
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        }),
      );
    //   if (!this.isRefreshingToken) {
    // } else {
    //   return this.tokenSubject.pipe(
    //     filter(token => token != null),
    //     take(1),
    //     switchMap(token => {
    //       return next.handle(this.updateHeaders(req));
    //     })
    //   );
    // }



  }
}


// er => {
//   this.loginService.logount();
// }