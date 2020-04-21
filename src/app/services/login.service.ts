import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }
  
  login(login, password) {
    const data: any = new FormData();
    data.append("login", login);
    data.append("password", password);

    return this.http.post(environment.apiUrl + `/back/auth.php`, data);
  }
}
