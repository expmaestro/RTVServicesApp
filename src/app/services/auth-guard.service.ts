import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private nav: NavController, private settingsService: SettingsService) { }
  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    return Observable.create(observer => {
      let url: string = state.url;
      if (url.endsWith("login")) {
        console.log('endWith login')
        observer.next(true);
        observer.complete();
      } else {
        this.settingsService
          .IsLoggedIn()
          .then(r => {
            observer.next(r);
            observer.complete();
            if (!r) {
              this.navigateToLogin();
            }
          })
          .catch(r => {
            this.navigateToLogin();
            observer.next(false);
            observer.complete();
          });
      }
    });
  }

  navigateToLogin() {
    console.log('Login')
    this.nav.navigateRoot("/login");
  }
}
