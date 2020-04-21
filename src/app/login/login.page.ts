import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public loginForm = new FormGroup({
    login: new FormControl('expmaestro', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  apiUrl: any;
  constructor(private loginService: LoginService) { }

  ngOnInit() {
    this.apiUrl = environment.apiUrl
  }

  login() {

    this.loginService.login(this.loginForm.get('login').value, this.loginForm.get('password').value)
      .subscribe((x: any) => {
        console.log(x);
        if (x.AUTHORIZED) {
          alert('Success');
        } else {
          alert(x.MESSAGE);
        }
      });
  }

}
