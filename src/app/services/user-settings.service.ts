import { Injectable } from '@angular/core';
const appTokenKey = "appToken";
@Injectable({
  providedIn: 'root'
})

export class UserSettingsService {

  constructor() { } //remove TODO:

  public get authToken() {
    return window.localStorage.getItem(appTokenKey);
  }

  public set authToken(token: any) {
    window.localStorage.setItem(appTokenKey, token ? token : '');
  }
}
