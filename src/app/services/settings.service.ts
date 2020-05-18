import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { BaseComponent } from './base-component';
import { map, catchError } from "rxjs/operators";

const RTVTokenStorageKey = "_RTVLongToken";
const profileStorageKey = '_userName';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends BaseComponent {
  userData$ = new BehaviorSubject(null);
  constructor(private http: HttpClient) { super(); }

  IsLoggedIn(): Promise<boolean> {
    return new Promise(resolve => {
      resolve(!!this.authToken); //&& !!this.refreshToken
    });
  }

  get authToken() {
    return window.localStorage.getItem(RTVTokenStorageKey);
  }

  set authToken(token: string) {
    window.localStorage.setItem(RTVTokenStorageKey, token ? token : "");
  }

  getUserInfo() {
    return this.http.get(environment.apiUrl + `/back/srv/mobile/user.php?action=profile`);
  }

  updateUserCoord(type: string, enumId: string) {
    let body = {};
    body[type] = enumId;
    return this.http.post<any>(environment.apiUrl + `/back/srv/mobile/user.php?action=profile`, JSON.stringify(body));
  }

  get getUserDataFromStorage(): Profile {
    let storageData = localStorage.getItem(profileStorageKey);

    return JSON.parse(storageData);
  }


  get getProfileData() {
    return this.userData$.asObservable();
  }

  getProfileDataWithRequest() {
    this.getUserInfo().safeSubscribe(this, (r: any) => {
      this.setProfileData = r.data;
    }, 
    (e) => {
      this.setProfileData = this.getUserDataFromStorage;
    })
  }

  set setProfileData(data: Profile) {
    window.localStorage.setItem(profileStorageKey, data ? JSON.stringify(data) : "");
    if (data) {
      this.userData$.next(data);
    }
  }

}


export class Profile {
  USER_FIO: string;
  USER_ID: string;

  matrix: CoordVal;
  rPosition: CoordVal;
  softSignPosition: CoordVal;
  solidSignPosition: CoordVal;
  obraz: CoordVal;
  oblik: CoordVal;
  lobr: CoordVal;
  robl: CoordVal;
  stradasteya: CoordVal;
}

export class CoordVal {
  id: string;
  name: string;
  value: string;
  enumId: string;
}
