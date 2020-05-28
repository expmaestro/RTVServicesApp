import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { BaseComponent } from './base-component';
import { Profile, ServiceModel, } from '../backend/interfaces';
import { UserSettingsService } from './user-settings.service';

const RTVTokenStorageKey = "_RTVLongToken";
const profileStorageKey = '_profileData';
const servicesStorageKey = '_servicesData';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends BaseComponent {
  private userData$ = new BehaviorSubject({});
  private services$ = new BehaviorSubject(Array<ServiceModel>());
  constructor(private http: HttpClient, private userSettingsService: UserSettingsService) {
    super();
    let profile = localStorage.getItem(profileStorageKey);
    this.userData$.next(profile ? JSON.parse(profile) : {});
    let storageData = localStorage.getItem(servicesStorageKey);
    this.services$.next(storageData ? JSON.parse(storageData) : []);
  }

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

  servicesApi() {
    return this.http.get(environment.apiUrl + `/back/srv/mobile/service.php?action=list`)
  }

  getServices() {
    this.servicesApi().safeSubscribe(this, (r: any) => {
      this.setServicesData = r.data;
    });
  }

  userDataApi() {
    return this.http.get(environment.apiUrl + `/back/srv/mobile/user.php?action=profile`);
  }

  updateUserCoord(type: string, enumId: string) {
    let body = {};
    body[type] = enumId;
    return this.http.post<any>(environment.apiUrl + `/back/srv/mobile/user.php?action=profile`, JSON.stringify(body));
  }

  get getProfileDataAsync() {
    return this.userData$.asObservable();
  }

  getUserData() {
    this.userDataApi().safeSubscribe(this, (r: any) => {
      this.setProfileData = r.data;
    },
      (e) => {
        console.log(e);
      });
  }

  set setProfileData(data: Profile) {
    window.localStorage.setItem(profileStorageKey, data ? JSON.stringify(data) : "");
    if (data) {
      this.userData$.next(data);
    }
  }

  set setServicesData(data) {
    window.localStorage.setItem(servicesStorageKey, data ? JSON.stringify(data) : "");
    if (data) {
      this.services$.next(data);
    }
  }

  get getServicesDataAsync() {
    return this.services$.asObservable();
  }

}
