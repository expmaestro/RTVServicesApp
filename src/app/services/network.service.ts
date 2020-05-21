import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HTTP } from '@ionic-native/http/ngx';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private _isConnected = new BehaviorSubject<boolean>(false);
  constructor(private nativeHttp: HTTP, private alertController: AlertController, private http: HttpClient) { }

  async isConnected() {
    if (!this._isConnected.value) {
      this.noConnection('Нет подключения к сети');
      return;
    }
    let isConneted = await this.pingCdn();
    if (!isConneted) {
      this.noConnection('Нет интернет соединения');
      return;
    }
  }

  set setState(value: boolean) {
    this._isConnected.next(value);
  }

  pingCdn() {
    return this.pingCdnRequest().then(data => {
      if (data.status === 200) {
        return true;
      }
      console.log(data.status);
      return false;
    })
      .catch(error => {
        console.log(error.status);
        console.log(error.error);
        console.log(error);
        return false;
      });
  }

  pingCdnRequest() {
    return this.nativeHttp.head(environment.cdn + '/ngenix/audio/ozarin/polotno.mp3',
      {}, {});
  }  

  async pingApiRequest() {
    return await this.http.head(environment.apiUrl + `/back/srv/mobile/user.php?action=profile`, { observe: 'response' }).toPromise().then((data: any) => {
      console.log(data);
      if (data.status === 200) {
        return true;
      }
      console.log(data.status);
      return false;
    })
      .catch(error => {
        console.log(error.status);
        console.log(error.error);
        console.log(error);
        return false;
      });
  }

  private async noConnection(message: string) {
    const alert = await this.alertController.create({
      header: 'Ошибка',
      //subHeader: message,
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
