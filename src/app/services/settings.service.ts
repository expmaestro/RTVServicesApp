import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Subject } from 'rxjs';
import { BaseComponent } from './base-component';
import { Profile, ServiceModel, ServicePlayListModelObject, ServiceEnum } from '../backend/interfaces';
import { FilesService } from './files.service';

const RTVTokenStorageKey = "_RTVLongToken";
const profileStorageKey = '_profileData';
const servicesStorageKey = '_servicesData';
const servicePlayListStorageKey = '_servicesPlayListData';
const audioStructureStorageKey = '_audioStructureData';
const audioPlayListStorageKey = '_audioPlayListData';

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends BaseComponent {
  private userData$ = new BehaviorSubject({});
  private services$ = new BehaviorSubject(Array<ServiceModel>());
  private audioStructure$ = new BehaviorSubject(null);
  private servicePlayList$ = new BehaviorSubject<ServicePlayListModelObject>(null);
  private audioPlayList$ = new BehaviorSubject<ServicePlayListModelObject>(null);
  completeServiceRequest$ = new Subject();
  completeAudioRequest$ = new Subject();
  constructor(private http: HttpClient, private filesService: FilesService) {
    super();

    let profile = localStorage.getItem(profileStorageKey);
    this.userData$.next(profile ? JSON.parse(profile) : {});

    let services = localStorage.getItem(servicesStorageKey);
    this.services$.next(services ? JSON.parse(services) : []);

    let audio = localStorage.getItem(audioStructureStorageKey);
    this.audioStructure$.next(audio ? JSON.parse(audio) : null);

    const audioPlaylist = localStorage.getItem(`${audioPlayListStorageKey}`);
    this.audioPlayList$.next(audioPlaylist ? JSON.parse(audioPlaylist) : null);
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
    return this.http.get(environment.apiUrl + `/back/srv/mobile/service.php?action=list`);
  }

  getServices() {
    this.servicesApi().safeSubscribe(this, (r: any) => {
      if (r.errors.length === 0) {
        this.setServicesData(r.data, 'service');
      }
      this.completeServiceRequest$.next();
    }, () => {
      this.completeServiceRequest$.next();
    });
  }

  private getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  private audioApi() {
    const body = {
      collectionTypes: ["album", "audiobook", "rythm"],
      filter: { active: { "=": 1 } }
    }

    return this.http.post(environment.apiUrl + `/back/srv/materials/material.php?action=userList&_=${this.getRandomInt(1000000)}`, JSON.stringify(body));
  }

  private getAudioApi(collectionsIds: Array<number>) {
    const body = {
      collectionIds: collectionsIds
    }
    return this.http.post(environment.apiUrl + `/back/srv/materials/material.php?action=userLinkList&_=${this.getRandomInt(1000000)}`,
      JSON.stringify(body));
  }

  getAudioStructure() {
    this.audioApi().safeSubscribe(this, (r: any) => {
      if (r.errors.length === 0) {
        this.setServicesData(r.data, 'audio');
      }
      this.completeAudioRequest$.next();
    }, () => {
      this.completeAudioRequest$.next();
    })
  }

  private getSericePlayListApi(serviceId: number) {
    return this.http.get(environment.apiUrl + `/back/services/playlist/?serviceId=${serviceId}&all=true`);
  }

  getServicePlayList(serviceId: number) {
    this.getSericePlayListApi(serviceId).safeSubscribe(this, (data: any) => {
      this.setServicePlayList(serviceId, data);
    });
  }

  getAudioPlayList(serviceIds: Array<number>) {
    this.getAudioApi(serviceIds).safeSubscribe(this, (r: any) => { //260, 261
      if (r.errors.length === 0) {
        this.setAudioPlayList(r.data);
      }
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

  getUserProfileData() {
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

  setServicesData(data, type) {
    switch (type) {
      case 'audio':
        // object
        window.localStorage.setItem(audioStructureStorageKey, data ? JSON.stringify(data) : "{}");
        if (data) {
          let covers: string[] =
            Object.values(data)
              .filter((f: any) => f.image.length > 0)
              .map((m: any) => environment.apiUrl + `${m.image}`);
          this.filesService.cacheImages(covers, ServiceEnum.audio);
          this.audioStructure$.next(data);
        }
        break;

      case 'service':
        //array
        window.localStorage.setItem(servicesStorageKey, data ? JSON.stringify(data) : "");
        if (data) {
          let covers: string[] = data.map(m => m.cover);
          this.filesService.cacheImages(covers, ServiceEnum.service);
          this.services$.next(data);
        }
        break;
    }
  }

  get getServicesDataAsync() {
    return this.services$.asObservable();
  }

  get getAudioStructureAsync() {
    return this.audioStructure$.asObservable();
  }



  setServicePlayList(serviceId: number, data: any) {
    if (data && Object.keys(data).length > 0) {
      window.localStorage.setItem(`${servicePlayListStorageKey};$serviceId=${serviceId};`, data ? JSON.stringify(data) : "");
      if (data) {
        this.servicePlayList$.next(data);
      }
    }
  }

  setAudioPlayList(data: any) {
    if (data && Object.keys(data).length > 0) {
      const d = localStorage.getItem(`${audioPlayListStorageKey}`);
      let fromCache = d ? JSON.parse(d) : null
      let newObj = { ...fromCache, ...data };
      window.localStorage.setItem(`${audioPlayListStorageKey}`, newObj ? JSON.stringify(newObj) : "");
      if (newObj) {
        this.audioPlayList$.next(newObj);
      }
    }
  }

  getServicePlayListFromStorage(serviceId: number) {
    const data = localStorage.getItem(`${servicePlayListStorageKey};$serviceId=${serviceId};`);
    this.servicePlayList$.next(data ? JSON.parse(data) : null);
  }

  getServicePlayListAsync(serviceId: number) {//
    return this.servicePlayList$.asObservable();
  }

  getAudioPlayListAsync() {
    return this.audioPlayList$.asObservable();
  }

  getAudioPlayListValue() {
    return this.audioPlayList$.value;
  }

  getAudioStructureValue() {
    return this.audioStructure$.value;
  }

}
