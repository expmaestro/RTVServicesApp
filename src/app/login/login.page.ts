import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../services/login.service';
import { environment } from 'src/environments/environment';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { BaseComponent } from '../services/base-component';
import { SettingsService } from '../services/settings.service';
import { NetworkService } from '../services/network.service';
import { PushNotificationsService } from '../services/push-notifications.service';
@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage extends BaseComponent implements OnInit {

    private loading: any;
    process: boolean = false;
    showPassword = false;
    public loginForm = new FormGroup({
        login: new FormControl(environment.userName, [Validators.required]),
        password: new FormControl(environment.password, [Validators.required]),
    });
    apiUrl: any;
    constructor(
        private loginService: LoginService,
        private alertController: AlertController,
        private loadingCtrl: LoadingController,
        private route: Router,
        private nav: NavController,
        private settingsService: SettingsService,
        private networkService: NetworkService,
        private pushNotifications: PushNotificationsService,) {
        super();
    }

    ngOnInit() {
        this.apiUrl = environment.apiUrl
    }  
    

    async login() {
        console.log('login')
        if (!this.loginForm.valid) return;
        if (this.process) return;
        this.process = true;
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
                    this.settingsService.userProfileApi().safeSubscribe(this, async (r: any) => {
                        this.settingsService.setProfileData = r.data;
                        this.pushNotifications.updateToken();
                        await this.loading.dismiss();
                        this.process = false;
                        this.nav.navigateRoot('/tabs/services');
                    })

                } else {
                    let error = response.errors.length > 0
                        ? response.errors[0].message
                        : 'Ошибка авторизации';
                    await this.loading.dismiss();
                    this.process = false;
                    await this.showError(error);
                }

            }, async (error) => {
                console.log(error);
                await this.loading.dismiss();
                this.process = false;
                await this.networkService.isConnected();
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

    //{"status":"error","data":[],"errors":[{"message":"Not Authorized","code":0,"customData":null}]}

}
