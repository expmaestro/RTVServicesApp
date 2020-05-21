import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { HTTP } from '@ionic-native/http/ngx';

@Injectable({
  providedIn: 'root'
})

export class LoginService {

  constructor(private http: HttpClient) { }

  login(login, password) {
    const requestPayloadData = JSON.stringify({ login: login, password: password });
    return this.http.post(environment.apiUrl + `/back/srv/mobile/user.php?action=newToken`, requestPayloadData);
  }

  getRefreshToken(token) {
    return this.http.post<any>(environment.apiUrl + `/back/srv/mobile/user.php?action=auth`, JSON.stringify({ token: token }));
  }

  logout() {
    return this.http.get(environment.apiUrl + `/back/srv/mobile/user.php?action=logout`);
  } 

}
