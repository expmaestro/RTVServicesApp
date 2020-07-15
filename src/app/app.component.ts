import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';
import { BaseComponent } from './services/base-component';
import { NetworkService } from './services/network.service';
// import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import { AppMinimize } from '@ionic-native/app-minimize/ngx';
import { Router } from '@angular/router';
//import * as MusicControls from 'cordova-plugin-music-controls2/www/MusicControls';


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
    private networkService: NetworkService,
    // private backgroundMode: BackgroundMode,
    private appMinimize: AppMinimize,
    private router: Router
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

    this.platform.ready().then(() => {
      if (
        this.platform.is("android") ||
        this.platform.is("ios")) {
      }
    });

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      // this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initBackgroundMode();
      this.initBackButtonEvent();
    });
  }
  private window: any = window;
  initBackgroundMode() {

//debugger;
    var backgroundMode = this.window.cordova.plugins.backgroundMode;
    backgroundMode.setDefaults({
      text: 'Running in background!',
      hidden: true, //
      resume: true,
      color: '0098D9',
      icon: 'ic_launcher',
      allowClose: true,
      channelDescription: 'Keep the App running in the background',
      channelName: 'Keep running in background',
      subText: 'Small hint text',
      showWhen: false,
      silent: true,
    });
    backgroundMode.enable();
    backgroundMode.on('activate', function () {
      
      backgroundMode.disableWebViewOptimizations();
      // bg.disableBatteryOptimizations();
      console.log("Background status: activate");
      
    });
    backgroundMode.on('deactivate ', function() {
      console.log('Background status: deactivate');
    //  MusicControls.destroy(onSuccess => { }, onError => { });
    });
    backgroundMode.disableBatteryOptimizations();    
  }

  initBackButtonEvent() {
    this.platform.backButton.safeSubscribe(this, () => {
      if (this.router.url === '/services' || this.router.url === '/login') {
        this.appMinimize.minimize();
      }
    });
  }
}
