import { Component, OnInit, OnDestroy, ViewChild, NgZone, Input, ChangeDetectorRef } from '@angular/core';

import { Platform, } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { BehaviorSubject, timer } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BaseComponent } from '../services/base-component';
//import { MusicControls } from '@ionic-native/music-controls/ngx';
import * as MusicControls from 'cordova-plugin-music-controls2/www/MusicControls';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../services/network.service';
import { MusicControlService, StreamState } from '../services/music-control.service';
import { PlayListModel, SectionPlayList } from '../backend/interfaces';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent extends BaseComponent implements OnInit, OnDestroy {

  sectionPlayList: SectionPlayList = {
    playList: [],
    service: null
  };
  currentPlaylist: PlayListModel[] = [];
  isUpdateProgress$ = new BehaviorSubject<boolean>(false);
  private win: any = window;
  sectionName = '';
  trackName = '';
  private stopPlaylistFlag = false;
  state: StreamState;

  constructor(
    private platform: Platform,
    private zone: NgZone,
    private fileService: FilesService,
    private musicControlService: MusicControlService,
    private networkService: NetworkService,
    private cd: ChangeDetectorRef) {
    super();

    this.platform.ready().then(() => {
      if (
        this.platform.is("android") ||
        this.platform.is("ios")) {

        if (this.platform.is("android")) {
          // this.platform.pause.safeSubscribe(this, x => {
          //   console.log(x);
          //   MusicControls.destroy(onSuccess => { }, onError => { });
          // });
        }
        this.platform.pause.safeSubscribe(this, x => {
          const source = timer(1000);
          MusicControls.destroy(onSuccess => {
            source.safeSubscribe(this, () => {
              this.initMusicContols();
            })
          }, onError => { });

        });
      }
    });
  }

  convertFileSrc(url) {
    if (!url) {
      return url;
    }
    if (url.indexOf('/') === 0) {
      return this.win.WEBVIEW_SERVER_URL + '/_app_file_' + url;
    }
    if (url.indexOf('file://') === 0) {
      return this.win.WEBVIEW_SERVER_URL + url.replace('file://', '/_app_file_');
    }
    if (url.indexOf('content://') === 0) {
      return this.win.WEBVIEW_SERVER_URL + url.replace('content:/', '/_app_content_');
    }
    return url;
  };

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

  private initMusicContols() {
    if (this.musicControlService.currentIndex > -1) {
      MusicControls.create(
        this.musicControlService.mediaControlSettings(this.sectionName, this.trackName, !this.state?.playing, this.state?.playing),
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
        //console.log(events);

        switch (events.type) {
          case 'play':
            MusicControls.updateIsPlaying(true);
            MusicControls.updateDismissable(false);
            break;
          case 'pause':
            MusicControls.updateIsPlaying(false);
            MusicControls.updateDismissable(true);
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

    const src = this.currentPlaylist[this.musicControlService.currentIndex].path;
    this.trackName = this.currentPlaylist[this.musicControlService.currentIndex].name;
    const fileName = this.fileService.getFileNameFromSrc(src);
    console.log(fileName);
    const fileExist = await this.fileService.fileExist(fileName, this.sectionPlayList.service.id);
    const filePathOrUrl = fileExist
      ? this.convertFileSrc(this.fileService.getFullFilePath(this.sectionPlayList.service.id, fileName))
      : environment.cdn + src + '';
    console.log(filePathOrUrl);
    this.playStream(filePathOrUrl);
    this.initMusicContols();
  }

  pause() {
    this.musicControlService.pause();
  }

  play() {
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
    this.state.currentTime = 0;
    this.state.readableCurrentTime = '00:00';
    this.state.readableDuration = '00:00';
    this.musicControlService.setCurrentIndex(-1);
  }


  ngOnInit() {
    this.musicControlService.getState()
      .safeSubscribe(this, state => {
        if (this.stopPlaylistFlag && state.canplay) {
          this.pause();
          this.stopPlaylistFlag = false;
        }
        this.state = state;
      });


    this.musicControlService.getPlaylist.safeSubscribe(this, (data: SectionPlayList) => {
      this.sectionPlayList = data;
      let playlistAreSame = this.currentPlaylist.length > 0 ?
        JSON.stringify(this.sectionPlayList.playList.map(s => s.path)) === JSON.stringify(this.currentPlaylist.map(s => s.path))
        : true;
      this.musicControlService.setPlaylistAreSame(playlistAreSame);

      this.musicControlService.runTrack$.safeSubscribe(this, index => {
        this.runTrack(index);
      });
      if (this.musicControlService.currentIndex === -1 && data.playList.length > 0) {
        console.log('Auto run track');
        this.runTrack(0);
      }
    });
  }

  private runTrack(index: number) {
    this.currentPlaylist = this.sectionPlayList.playList;
    this.sectionName = this.sectionPlayList.service.name;
    this.openFile(index);
    this.musicControlService.setPlaylistAreSame(true);
  }
}
