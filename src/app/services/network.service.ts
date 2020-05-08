import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HTTP } from '@ionic-native/http/ngx';
import { environment } from 'src/environments/environment';
import { AlertController } from '@ionic/angular';


@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private _isConnected = new BehaviorSubject<boolean>(false);
  constructor(private nativeHttp: HTTP, private alertController: AlertController) { }

  async isConnected() {
    if (!this._isConnected.value) {
      this.noConnection('Нет подключения к сети');
      return;
    }
    let isConneted = await this.ping();
    if (!isConneted) {
      this.noConnection('Нет интернет соединения');
      return;
    }
  }

  set setState(value: boolean) {
    this._isConnected.next(value);
  }

  ping() {
    return this.pingRequest().then(data => {
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

  pingRequest() {
    return this.nativeHttp.head(environment.cdn + '/ngenix/audio/ozarin/polotno.mp3',
      {}, {});
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
