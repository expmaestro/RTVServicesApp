import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';
import { HTTP } from '@ionic-native/http/ngx';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient, private nativeHttp: HTTP) { }

  login(login, password, data1) {
    const data: any = new FormData();
    // let options = new HttpOptions({ headers: headers, withCredentials: true });
    //let headers = new HttpHeaders().append('Access-Control-Allow-Credentials', 'true');
    data.append("login", login);
    data.append("password", password);
    let t = {
      login: login,
      password: password
    }
    return this.http.post(environment.apiUrl + `/back/srv/mobile/user.php?action=newToken `, data1 );
  }

  loginByToken(token) {
    const data: any = new FormData();
    data.append("token", '111');
    return this.http.post(environment.apiUrl + `/back/srv/mobile/user.php?action=newToken `, data);
  }
  
 
}
