import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  private loading: any;
  public loginForm = new FormGroup({
    login: new FormControl('expmaestro', [Validators.required]),
    password: new FormControl('3M3AeGwK', [Validators.required]),
  });
  apiUrl: any;
  constructor(
    private loginService: LoginService,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private route: Router,
    private nav: NavController) { }

  ngOnInit() {
    this.apiUrl = environment.apiUrl
  }

  async login() {
    this.loading = await this.loadingCtrl.create({
      message: 'Пожалуйста подождите...'
    }
    );
    await this.loading.present();
    this.loginService.login(this.loginForm.get('login').value, this.loginForm.get('password').value)
      .subscribe(async (x: any) => {

        console.log(x);
        console.log(x.headers);
        // console.log(x.get('Set-Cookie'))
        // let d = x.replace(/'/g, '"');

        // var parsed = JSON.parse(d);
        // console.log(parsed);
        // console.log(parsed.AUTHORIZED)
        // if (parsed.AUTHORIZED) {
        // this.loginService.init().subscribe(x => {
        //   console.log(x);
        // },
        //    (err) => {
        //     await this.loading.dismiss();
        //     console.log(err);
        //   });
        // } else {
        //   this.wrongPassword(parsed.MESSAGE);
        // }
        await this.loading.dismiss();
       // this.route.navigate(['/services']);
       this.nav.navigateRoot('/services');
      }, async (error) => {
        console.log(error);
        await this.loading.dismiss();
      });
  }

  private async wrongPassword(message: string) {
    const alert = await this.alertController.create({
      header: 'Ошибка!',
      //subHeader: message,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

}
