import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { SettingsService } from './settings.service';
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { LoginService } from './login.service';
import { catchError, switchMap, finalize, take, filter, map, tap } from "rxjs/operators";
import { NavController, AlertController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {
  isRefreshingToken: boolean = false;
  showAlert: boolean = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(private settings: SettingsService, private loginService: LoginService, private nav: NavController,
    private alertController: AlertController,) { }

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
              if (event.body.errors[0].message === 'Not authorized' || event.body.errors[0].message === 'Not authorized admin') {
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
              default:
                console.log('interceptor throwError')
                return throwError(error);
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
        if (response && response.status === 'error' &&( response.errors[0].message === 'Invalid token' ||  response.errors[0].message === 'Token has expired')) {
          // debugger;
          this.nav.navigateRoot("/login");
          this.presentAlert()
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

  async presentAlert() {
    if (!this.showAlert) {
      this.showAlert = true;
      const alert = await this.alertController.create({
        cssClass: 'text-justify',
        header: 'Ошибка',
        message: 'Под вашим логином совершён вход на другом мобильном устройстве, в один момент приложение может работать только на одном устройстве. Если это были не вы - обратитесь на <a href="support@rithm-time.tv">support@rithm-time.tv</a>',
        buttons: [
          {
            text: 'ОК',
           //role: 'cancel',
           // cssClass: 'secondary',
            handler: (blah) => {
              this.showAlert = false;
            }
          }
        ]
      });
      await alert.present();
    }

  }
}


// er => {
//   this.loginService.logout();
// }

// Http 510
// Not authorized  - пользователь не авторизован
// Not authorized admin - админ не авторизован
// Token has expired - токен устарел
// Authorization error - ошибка авторизации
// Invalid token - кривой токен, не прошёл проверку
// Также метод login может вернуть сообщение от битрикса, почему нельзя авторизоваться.