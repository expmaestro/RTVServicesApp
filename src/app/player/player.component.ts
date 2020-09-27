import { Component, OnInit, OnDestroy, ViewChild, NgZone, Input, ChangeDetectorRef } from '@angular/core';

import { Platform, AlertController, } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { BehaviorSubject, timer, Subscription, SubscriptionLike } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BaseComponent } from '../services/base-component';
//import { MusicControls } from '@ionic-native/music-controls/ngx';
import * as MusicControls from 'cordova-plugin-music-controls2/www/MusicControls';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../services/network.service';
import { MusicControlService, StreamState } from '../services/music-control.service';
import { PlayListModel, SectionPlayList, ServiceEnum } from '../backend/interfaces';
import { DataService } from '../services/data.service';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent extends BaseComponent implements OnInit, OnDestroy {

  sectionPlayList: SectionPlayList = {
    playList: [],
    type: ServiceEnum.service
  };
  currentPlaylist: PlayListModel[] = [];
  private win: any = window;
  //sectionName = '';
  private stopPlaylistFlag = false;
  private playlistFinished = false;
  state: StreamState;
  subscriptionToLiveApp: Subscription;
  private platformResume = true;
  private minutesWhenExit = 60;
  subscriptions: Subscription[] = [];
  isAndroid = false;
  isIos = false;
  currentTrackEntity: PlayListModel;

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private fileService: FilesService,
    private musicControlService: MusicControlService,
    private networkService: NetworkService,
    private dataService: DataService,
    private alertController: AlertController,
    public cd: ChangeDetectorRef
  ) {
    super();

    this.platform.ready().then(() => {
      if (this.platform.is("android")) { this.isAndroid = true; }
      if (this.platform.is("ios")) { this.isIos = true; }

      if (
        this.platform.is("android") ||
        this.platform.is("ios")) {

        // if (this.platform.is("android")) {
        // this.platform.pause.safeSubscribe(this, x => {
        //   console.log(x);
        //   MusicControls.destroy(onSuccess => { }, onError => { });
        // });
        // }
        this.platform.resume.safeSubscribe(this, () => {
          this.platformResume = true;
          console.log('platform resume');
          //this.state?.playing
          this.deactivateTimer();
        });

        this.platform.pause.safeSubscribe(this, x => {
          this.platformResume = false;
          console.log('platform pause');

          if (!this.state?.playing) {
            this.activateTimer();
          }
          if (this.isAndroid) {
            const source = timer(1000);
            MusicControls.destroy(onSuccess => {
              source.safeSubscribe(this, () => {
                this.initMusicContols(this.state.playing, !this.state.playing);
              })
            }, onError => { });

          }

        });
      }
    });
  }

  prevTrack() {
    if (this.disablePrev()) return; // btn disable too
    const index = this.musicControlService.currentIndex > 0 ? this.musicControlService.currentIndex - 1 : this.currentPlaylist.length - 1;
    this.musicControlService.setCurrentIndex(index);
    this.openFile(index);
  }

  nextTrack() {
    if (this.disableNext()) return; // btn disable too
    const index = this.musicControlService.currentIndex + 1 >= this.currentPlaylist.length ? -1 : this.musicControlService.currentIndex + 1;
    this.musicControlService.setCurrentIndex(index);
    if (index !== -1) this.openFile(index);
  }

  private initMusicContols(isPlaying, dismissable) {
    if (this.musicControlService.currentIndex > -1) {
      const fullpath = this.fileService.getCoverFullPath(this.fileService.getCoverImageName(this.currentTrackEntity.cover), this.sectionPlayList.type);
      console.log(fullpath);
      //console.log(this.state?.playing);
      MusicControls.create(
        this.musicControlService.mediaControlSettings(this.currentTrackEntity.sectionName, this.currentTrackEntity.name, isPlaying, dismissable, fullpath),
        (success) => console.log(success),
        (error) => console.log(error));

      // Register callback
      MusicControls.subscribe(x => this.events(x));
      // Start listening for events
      // The plugin will run the events function each time an event is fired
      MusicControls.listen();
    }
  }

  events(action) {
    this.zone.run(() => {
      const message = JSON.parse(action).message;
      switch (message) {
        case 'music-controls-next':
          console.log('music-controls-next');
          this.nextTrack();
          break;
        case 'music-controls-previous':
          console.log('music-controls-previous');
          this.prevTrack();
          break;
        case 'music-controls-pause':
          console.log('music-controls-pause');
          this.pause();
          break;
        case 'music-controls-play':
          console.log('music-controls-play')
          this.play();
          break;
        case 'music-controls-destroy':
          console.log('music-controls-destroy')
          // Do something
          break;

        // External controls (iOS only)
        case 'music-controls-toggle-play-pause':
          this.toggle();
          break;
        case 'music-controls-seek-to':
          // const seekToInSeconds = JSON.parse(action).position;
          // MusicControls.updateElapsed({
          //   elapsed: seekToInSeconds,
          //   isPlaying: true
          // });
          // Do something
          break;

        // Headset events (Android only)
        // All media button events are listed below
        case 'music-controls-media-button':
          // Do something
          break;
        case 'music-controls-headset-unplugged':
          // Do something
          break;
        case 'music-controls-headset-plugged':
          // Do something
          break;


        case 'music-controls-media-button-next': {
          console.log('---next');
          this.nextTrack();
          break;
        }
        case 'music-controls-media-button-previous': {
          console.log('---prev');
          this.prevTrack();
          break;
        }
        case 'music-controls-media-button-pause':
          console.log('---payse')
          break;
        case 'music-controls-media-button-play':
          console.log('---play')
          break;

        case 'music-controls-media-button-play-pause': {
          console.log('---play pause');
          this.toggle();
          break;
        }
        default:
          break;
      }
    });
  }


  private destroyMusicControl() {
    MusicControls.destroy(onSuccess => { }, onError => { });
  }

  playStream(url) {
    this.musicControlService.playStream(url)
      .pipe(filter((f: any) => f.type !== 'timeupdate'))
      .subscribe(async events => {
        // console.log(events);

        switch (events.type) {
          case 'play':
            this.initMusicContols(true, false);
            //   MusicControls.updateIsPlaying(true);
            // MusicControls.updateDismissable(false);
            break;
          case 'pause':
            this.initMusicContols(false, true)
            //   MusicControls.updateIsPlaying(false);
            // MusicControls.updateDismissable(true); 
            break;
          case 'ended':
            if (this.disableNext()) {
              this.stopPlaylistFlag = true;
              this.openFile(0);
            } else {
              this.nextTrack();
            }
            break;
          case 'error':
            //ERR_INTERNET_DISCONNECTED
            await this.networkService.isConnected();
            this.destroyMusicControl();
            break;
        }
      });
  }

  async openFile(index) {
    this.musicControlService.setCurrentIndex(index);
    this.musicControlService.stop();
    this.currentTrackEntity = this.currentPlaylist[this.musicControlService.currentIndex];
    if (!this.currentTrackEntity) {
      console.log(this.currentPlaylist);
      console.log(this.musicControlService.currentIndex);
      console.log('Warning: Can not open file: ' + index);
    }

    const filePath = this.currentTrackEntity.path;
    if (!filePath) {
      this.noConnection('Ошибка открытия файла. Пожалуйста напишите нам на <a href="mailto:support@rithm-time.tv">support@rithm-time.tv</a>');
      return;
    }

    const fileName = this.fileService.getFileNameFromSrc(filePath);
    console.log('Open track with name: ' + fileName);
    const fileExist = await this.fileService.fileExist(fileName, this.currentTrackEntity.serviceId);
    const filePathOrUrl = fileExist
      ? this.win.Ionic.WebView?.convertFileSrc(this.fileService.getFullFilePath(this.currentTrackEntity.serviceId, fileName))
      : (filePath.includes('https') ? '' : environment.cdn) + filePath + '';
    console.log(filePathOrUrl);
    // this.initMusicContols();
    this.playStream(filePathOrUrl);

  }

  pause() {
    this.musicControlService.pause();
    this.activateTimer();
  }

  private activateTimer() {
    if (!this.platformResume) {
      console.log('activate timer');
      const source = timer(1000 * 60 * this.minutesWhenExit); //1000 * 60 * 30
      this.subscriptionToLiveApp = source.subscribe(val => {
        this.destroyMusicControl();
        navigator['app'].exitApp();
      });
    }

  }

  private deactivateTimer() {
    if (this.subscriptionToLiveApp) {
      console.log('deactivate timer');
      this.subscriptionToLiveApp.unsubscribe();
      this.subscriptionToLiveApp = null;
    }
  }

  play() {
    this.deactivateTimer();
    this.musicControlService.play();
  }

  stop() {
    this.musicControlService.stop();
  }

  onSliderChangeEnd(change) {
    this.musicControlService.seekTo(change.value);
  }

  private toggle() {
    if (this.state?.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  disablePrev() {
    return this.musicControlService.currentIndex === 0;
  }

  disableNext() {
    return this.musicControlService.currentIndex === this.currentPlaylist.length - 1;
  }

  ngOnDestroy() {
    console.log('destroy');
    this.destroyMusicControl();
    this.musicControlService.stop();
    if (this.state) {
      this.state.currentTime = 0;
      this.state.readableCurrentTime = '00:00';
      this.state.readableDuration = '00:00';
    }
    this.musicControlService.setCurrentIndex(-1);


    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }


  ngOnInit() {
    console.log('INIT PLAYER COMPONENT');
    let sub0 = this.musicControlService.getState()
      .safeSubscribe(this, state => {
        if (this.stopPlaylistFlag && state.canplay) {
          this.pause();
          this.stopPlaylistFlag = false;
          this.playlistFinished = true;
        }
        this.state = state;
      });
    this.subscriptions.push(sub0);

    let sub1 = this.musicControlService.runTrack$.safeSubscribe(this, index => {
      console.log('Run track manually');
      this.runTrack(index);
    });
    this.subscriptions.push(sub1);
    let playlistSubscription = this.musicControlService.getPlaylist
      .pipe(filter(f => f.playList.length > 0))
      .safeSubscribe(this, (data: SectionPlayList) => {
        console.log('Get play list');
        console.log(data);
        this.sectionPlayList = data;
        let playlistAreSame = this.currentPlaylist.length > 0 ?
          JSON.stringify(this.sectionPlayList.playList.map(s => s.path)) === JSON.stringify(this.currentPlaylist.map(s => s.path))
          : true;
          console.log(`Playlist are same ?`  + playlistAreSame);
          console.log( JSON.stringify(this.sectionPlayList.playList.map(s => s.path)))
          console.log( JSON.stringify(this.currentPlaylist.map(s => s.path)))
        this.musicControlService.setPlaylistAreSame(playlistAreSame);
        if (data.playList.length > 0 && data.playList[0].serviceId === 3) return;
        if (data.type === ServiceEnum.service && (this.musicControlService.currentIndex === -1 && data.playList.length > 0 || this.playlistFinished)) {
          this.playlistFinished = false;
          console.log('Auto run track');
          this.runTrack(0);
        }
      });
    this.subscriptions.push(playlistSubscription);
  }

  private async noConnection(message: string) {
    const alert = await this.alertController.create({
      header: 'Ошибка',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

  private runTrack(index: number) {
    this.currentPlaylist = this.sectionPlayList.playList;
    console.log(this.currentPlaylist);
   // this.sectionName = this.sectionPlayList.playList[index].sectionName;
    this.openFile(index);
    this.musicControlService.setPlaylistAreSame(true);
  }
}
