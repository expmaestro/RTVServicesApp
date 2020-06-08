import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { BaseComponent } from './base-component';
import { Profile, ServiceModel, ServicePlayListModel, } from '../backend/interfaces';

const RTVTokenStorageKey = "_RTVLongToken";
const profileStorageKey = '_profileData';
const servicesStorageKey = '_servicesData';
const servicePlayListStorageKey = '_servicesPlayListData';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends BaseComponent {
  private userData$ = new BehaviorSubject({});
  private services$ = new BehaviorSubject(Array<ServiceModel>());
  private servicePlayList$ = new BehaviorSubject<ServicePlayListModel>(null);
  constructor(private http: HttpClient) {
    super();
    let profile = localStorage.getItem(profileStorageKey);
    this.userData$.next(profile ? JSON.parse(profile) : {});
    let services = localStorage.getItem(servicesStorageKey);
    this.services$.next(services ? JSON.parse(services) : []);
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

  private servicesApi() {
    return this.http.get(environment.apiUrl + `/back/srv/mobile/service.php?action=list`)
  }

  getServices() {
    this.servicesApi().safeSubscribe(this, (r: any) => {
      this.setServicesData(r.data);
    });
  }

  private getSericePlayListApi(service: ServiceModel, params: number[]) {
    const next = service.loadAll ? '' : `&next=${params.join(',')}`
    return this.http.get(environment.apiUrl + `/back/services/playlist/?serviceId=${service.id}${next}`);
  }

  getServicePlayList(service: ServiceModel, params: number[]) {
    this.getSericePlayListApi(service, params).safeSubscribe(this, (data: any) => {
      this.setServicePlayList(service, params, data);
    });
  }

  userProfileApi() {
    return this.http.get(environment.apiUrl + `/back/srv/mobile/user.php?action=profile`);
  }

  updateUserCoordApi(type: string, enumId: string) {
    let body = {};
    body[type] = enumId;
    return this.http.post<any>(environment.apiUrl + `/back/srv/mobile/user.php?action=profile`, JSON.stringify(body));
  }

  get getProfileDataAsync() {
    return this.userData$.asObservable();
  }

  getUserData() {
    this.userProfileApi().safeSubscribe(this, (r: any) => {
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

  setServicesData(data) {
    window.localStorage.setItem(servicesStorageKey, data ? JSON.stringify(data) : "");
    if (data) {
      this.services$.next(data);
    }
  }

  get getServicesDataAsync() {
    return this.services$.asObservable();
  }

  setServicePlayList(service: ServiceModel, params, data) {
    if (data && data.main) {
      window.localStorage.setItem(this.getServiceStorageKey(service, params), data ? JSON.stringify(data) : "");
      if (data) {
        this.servicePlayList$.next(data);
      }
    }
  }

  getServicePlayListFromStorage(service: ServiceModel, params) {
    let data = localStorage.getItem(this.getServiceStorageKey(service, params));
    this.servicePlayList$.next(data ? JSON.parse(data) : null);
  }

  private getServiceStorageKey(service: ServiceModel, params) {
    let hash = `serviceId=${service.id}-` + (service.loadAll ? '' : params.join('-'));
    return `${servicePlayListStorageKey};${hash}`
  }

  getServicePlayListAsync(serviceId: number) {//
    return this.servicePlayList$.asObservable();
  }

}
