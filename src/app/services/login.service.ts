import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }
  

  login(login, password) {
    const data: any = new FormData();
   // let options = new HttpOptions({ headers: headers, withCredentials: true });
  //let headers = new HttpHeaders().append('Access-Control-Allow-Credentials', 'true');
    data.append("login", login);
    data.append("password", password);
    return this.http.post(environment.apiUrl + `/back/auth.php`, data, {     
     // headers: headers,
       responseType: 'text',
       observe: 'response' as 'response',
      // withCredentials: true
    });
  }

  init() {
    return this.http.get(environment.apiUrl + `/back/init.php?_=1587479318554`)
  }
}
