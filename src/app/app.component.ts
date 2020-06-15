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


    var bg = this.window.cordova.plugins.backgroundMode;
    bg.setDefaults({
      text: 'App is running in background!',
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
    bg.enable();
    bg.on('activate', function () {
      bg.disableWebViewOptimizations();
      // bg.disableBatteryOptimizations();
      console.log('actiate');
      console.log("background activate !!!!");
      bg.isIgnoringBatteryOptimizations(function (isIgnoring) {
        console.log(`isIgnoring: ${isIgnoring}`);
      })
    });
    bg.disableBatteryOptimizations();
    //bg.moveToBackground();
    // this.backgroundMode.enable();
    //this.window.cordova.plugins.backgroundMode.enable();
    // this.backgroundMode.setDefaults({
    //   title: "helo <b>Энергозаряд</b>",
    //   text: "Text <b>Энергозаряд</b>",
    //   icon: 'ic_launcher',
    //   //color: "F14F4D",
    //   resume: true
    // })
    // this.backgroundMode.setDefaults({ 
    //  // silent: true,
    //     hidden: true,
    //     title: 'Наш текст', //TODO remove,
    //     // text: 'Gavaleshko',
    //     // icon: 'ic_launcher.png',
    //     // ticker: 'ticker ticker',
    //     // color: 'FF0000'
    //    });
    // this.backgroundMode.configure({
    //   title: 'Наш текст',
    //   // text: "The app is running in the background...",
    //  // resume: true,
    //   hidden: true,
    //   // bigText: false,
    //   //silent: true,
    // });
    // this.backgroundMode.on("activate").subscribe(() => {
    //   // this.backgroundMode.disableWebViewOptimizations();
    //   // this.backgroundMode.disableBatteryOptimizations();
    //   console.log("background activate !!!!");
    // });

    // this.backgroundMode.on("enable").subscribe(() => {
    //   this.backgroundMode.disableWebViewOptimizations();
    //   this.backgroundMode.disableBatteryOptimizations();
    //   console.log("background enable !!!!");
    // });
  }

  initBackButtonEvent() {
    this.platform.backButton.safeSubscribe(this, () => {
      if (this.router.url === '/services' || this.router.url === '/login') {
        this.appMinimize.minimize();
      }
    });
  }
}
