import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { BaseComponent } from '../services/base-component';
import { SettingsService } from '../services/settings.service';
@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage extends BaseComponent implements OnInit {

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
        private nav: NavController,
        private settingsService: SettingsService) {
        super();
    }

    ngOnInit() {
        this.apiUrl = environment.apiUrl
    }

    async login() {
        this.loading = await this.loadingCtrl.create({
            message: 'Пожалуйста подождите...'
        });
        await this.loading.present();
        this.loginService.login(this.loginForm.get('login').value, this.loginForm.get('password').value)
            .safeSubscribe(this, async (response: any) => {
                console.log(response);
                let token = response.data.token;
                this.settingsService.authToken = token;
                console.log(token);
                if (response.status === 'success') {
                    this.loginService.getRefreshToken(token).safeSubscribe(this, async (r: any) => {
                        if (r.status === 'success') {
                            let sessionId = r.data.PHPSESSID;
                            this.settingsService.refreshToken = sessionId;
                            await this.loading.dismiss();
                        } else {
                            let er = r.errors.length > 0
                                ? r.errors[0].message
                                : 'Ошибка авторизации';
                            await this.loading.dismiss();
                            await this.showError(er);
                        }
                        console.log(r);
                    });
                } else {
                    let error = response.errors.length > 0
                        ? response.errors[0].message
                        : 'Ошибка авторизации';
                    await this.loading.dismiss();
                    await this.showError(error);
                }
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
                // this.nav.navigateRoot('/services');
            }, async (error) => {
                console.log(error);
                await this.loading.dismiss();
            });
    }

    private async showError(message: string) {
        const alert = await this.alertController.create({
            header: 'Ошибка',
            //subHeader: message,
            message: message,
            buttons: ['OK']
        });

        await alert.present();
    }



}
