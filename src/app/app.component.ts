import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';
import { BaseComponent } from './services/base-component';
import { NetworkService } from './services/network.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent extends BaseComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private network: Network,
    private networkService: NetworkService
  ) {
    super();
    this.initializeApp();
    this.network.onConnect().safeSubscribe(this, s => setTimeout(() => {
      this.networkService.setState = true;
      console.log('Network connected: ' + this.network.type);
      console.log(navigator.onLine);
    }, 0));

    this.network.onDisconnect().safeSubscribe(this, s => setTimeout(() => {
      this.networkService.setState = false;
      console.log('Network disconnected: ' + this.network.type) 
      console.log(navigator.onLine);
    }, 0));
    
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      // this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
