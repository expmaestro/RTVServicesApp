import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService, PlayListModel } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { Platform, LoadingController, AlertController, IonRange } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { BehaviorSubject, Subscription, from } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { BaseComponent } from '../services/base-component';
//import { MusicControls } from '@ionic-native/music-controls/ngx';
import * as MusicControls from 'cordova-plugin-music-controls2/www/MusicControls';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../services/network.service';
import { LoadingService } from '../services/loading.service';
import { Howl } from 'howler';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';


@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('range', { static: false }) range: IonRange;
  playlist: PlayListModel[] = [];
  typeId = 0;
  segments: UrlSegment[];
  secretName = new FormControl('');
  secretNameWarning: string = '';
  currentIndex = -1;
  seekTime = 0;
  progress = 0;
  isUpdateProgress$ = new BehaviorSubject<boolean>(false);
  isPlaying$ = new BehaviorSubject<boolean>(false);
  duration = 1;
  private win: any = window;
  id = null;
  private platformReady = false;

  player: Howl = null;

  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private platform: Platform,
    private loadingService: LoadingService,
    private zone: NgZone,
    private fileService: FilesService,
    private changeRef: ChangeDetectorRef,
    // private musicControl: MusicControls,
    //public backgroundMode: BackgroundMode,
    private networkService: NetworkService) {
    super();
    // window.addEventListener('beforeunload', () => {
    //   console.log("Kbeforeunload");
    //   MusicControls.destroy(onSuccess => { }, onError => { });
    // });

    this.platform.ready().then(() => {
      if (
        this.platform.is("android") ||
        this.platform.is("ios")) {

        console.log('Pl ready')
        this.platformReady = true; //TODO: remove this

        // this.platform.pause.safeSubscribe(this, x => {
        //   if (!this.backgroundMode.isActive()) {
        //     console.log(x);
        //     MusicControls.destroy(onSuccess => { }, onError => { });
        //   }
        // });


      }
    });
  }

  setSecretName() {
    this.secretNameWarning = '';
    const letters: string[] = ['А', 'О', 'У', 'Я', 'И', 'Е', 'Ы', 'Ь', 'Ъ', 'Р'];
    const noLetters: string[] = [];
    const input: string = this.secretName.value.toLowerCase();
    letters.forEach(letter => {
      if (!input.includes(letter.toLowerCase())) {
        noLetters.push(letter)
      }
    });
    if (noLetters.length > 0) {
      this.secretNameWarning = `Вы не ввели буквы: ${noLetters.join(', ')}`;
    }
    this.getPlayList();
  }

  private getPlayList() {
    if (this.segments.length > 0) {
      this.typeId = Number(this.segments[0].path);
      let params = this.segments.filter((param, index) => index > 0).map((x) => x.path);
      this.playlist = this.dataService.getPlayList(this.typeId, this.secretName.value, params);
      console.log(this.playlist)
    }
  }

  async play(index: number, stopInTheEnd: boolean = true) {
    if (index > this.playlist.length - 1) {
      this.isPlaying$.next(false);
      return; //auto stop
    }
    if (stopInTheEnd && index === 0) {
      this.currentIndex = -1;
      this.isPlaying$.next(false);
      return;
    }

    if (this.isPlaying$.value) {
      this.upload();
    }

    this.currentIndex = index;
    this.changeRef.detectChanges();
    const src = this.playlist[this.currentIndex].src;
    const fileName = this.fileService.getFileNameFromSrc(src);
    const fileExist = this.platformReady
      ? await this.fileService.fileExist(fileName)
      : false;
    let filePathOrUrl = fileExist
      ? this.convertFileSrc(this.fileService.getFullFilePath(fileName))
      : environment.cdn + src + '';

    console.log(filePathOrUrl);
    if (this.player) {
      this.player.stop();
    }

    this.player = new Howl({
      src: [filePathOrUrl],
      html5: true,
      onloaderror: async (e) => {
        //ERR_INTERNET_DISCONNECTED
        await this.networkService.isConnected();
        console.log('onloaderror')
      },
      onplayerror: () => {
        console.log('onplayerror');
        this.isUpdateProgress$.next(false);
      },
      onplay: () => {
        this.musicControlSettings();
        MusicControls.updateIsPlaying(true);
        this.isUpdateProgress$.next(true);
        console.log('onPlay');
        this.isPlaying$.next(true);
        this.duration = this.player.duration();
        this.updateProgress();
      },
      onend: () => {
        this.isUpdateProgress$.next(false);
        this.nextTrack(true);
        console.log('onEnd');
      },
      onpause: () => {
        this.isPlaying$.next(false);
        MusicControls.updateIsPlaying(false);
        this.isUpdateProgress$.next(false);
        console.log('onpause');
      },
      onstop: () => {
        this.isPlaying$.next(false);
        this.isUpdateProgress$.next(false);
        console.log('onstop');
      },
      onmute: () => {
        console.log('onmute');
      },
      onvolume: () => {
        console.log('onvolume');
      },
      onrate: () => {
        console.log('onrate');
      },
      onseek: () => {
        console.log('onseek');
      },
      onfade: () => {
        console.log('onfade');
      },
      onunlock: () => {
        console.log('onunlock');
      }
    })
    this.id = this.player.play();
  }

  togglePlayer(pause) {
    this.isPlaying$.next(!pause);
    if (pause) {
      this.player.pause();
    } else {
      if (this.currentIndex === -1) {
        this.play(0, false);
      } else {
        this.player.play();
      }
    }
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

  secondsToHms(d) {
    if (!d || d === 1) return '00:00';
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h : "";
    var mDisplay = (m < 10 ? '0' : '') + m;
    var sDisplay = (s < 10 ? "0" : "") + s;
    return (hDisplay ? hDisplay + ':' : '') + mDisplay + ':' + sDisplay;
  }

  seek() {
    let newValue = +this.range.value;
    this.player.seek(newValue);
  }

  onSliderChangeEnd(change) {
    this.player.seek(change.value);
  }

  timeOutId: any;
  updateProgress() {
    console.log('upd');
    if (!this.id) return;
    let seekTime = this.player.seek();
    if (typeof seekTime === 'number' && this.seekTime !== seekTime) {
      this.seekTime = seekTime;
      this.progress = this.seekTime || 0;
    }
    this.timeOutId = setTimeout(() => {
      this.updateProgress();
    }, 200)
  }

  prevTrack() {
    if (this.currentIndex < 1) return; //btn disable too
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
    this.play(this.currentIndex, false);
  }

  nextTrack(stopInTheEnd = false) {
    if (!stopInTheEnd && this.currentIndex === this.playlist.length - 1) return; //btn disable too
    this.currentIndex = this.currentIndex + 1 >= this.playlist.length ? 0 : this.currentIndex + 1;
    this.play(this.currentIndex, stopInTheEnd);
  }

  musicControlSettings() {
    MusicControls.create({
      track: this.dataService.getServiceName(Number(this.segments.length > 0 ? this.segments[0].path : 0)),		// optional, default : ''
      artist: this.playlist[this.currentIndex].title,// 'Muse',						// optional, default : ''
      album: this.playlist[this.currentIndex].title,     // optional, default: ''
      cover: '',		// optional, default : nothing
      // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
      //			 or a remote url ('http://...', 'https://...', 'ftp://...')
      isPlaying: true,							// optional, default : true
      dismissable: true,							// optional, default : false

      // hide previous/next/close buttons:
      hasPrev: true,		// show previous button, optional, default: true
      hasNext: true,		// show next button, optional, default: true
      hasClose: false,		// show close button, optional, default: false

      // iOS only, optional
      duration: 60, // optional, default: 0
      elapsed: 10, // optional, default: 0
      hasSkipForward: true, //optional, default: false. true value overrides hasNext.
      hasSkipBackward: true, //optional, default: false. true value overrides hasPrev.
      skipForwardInterval: 15, //optional. default: 0.
      skipBackwardInterval: 15, //optional. default: 0.
      hasScrubbing: false, //optional. default to false. Enable scrubbing from control center progress bar 

      // Android only, optional
      // text displayed in the status bar when the notification (and the ticker) are updated
      // ticker: 'Now playing "Time is Running Out"',
      //All icons default to their built-in android equivalents
      //The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
      playIcon: 'ic_stat_play_arrow',
      pauseIcon: 'ic_stat_pause',
      prevIcon: 'ic_stat_skip_previous',
      nextIcon: 'ic_stat_skip_next',
      closeIcon: 'media_close',
      notificationIcon: 'notification'
    },
      (success) => console.log(success),
      (errore) => console.log(errore));

    // Register callback
    MusicControls.subscribe(x => this.events(x));

    // Start listening for events
    // The plugin will run the events function each time an event is fired
    MusicControls.listen();

  }

  events(action) {
    this.zone.run(() => {
      const message = JSON.parse(action).message;
      switch (message) {
        case 'music-controls-next':
          console.log('music-controls-next');
          this.nextTrack();
          // Do something
          break;
        case 'music-controls-previous':
          console.log('music-controls-previous');
          this.prevTrack();
          // Do something
          break;
        case 'music-controls-pause':
          console.log('music-controls-pause');
          this.togglePlayer(this.isPlaying$.value);
          break;
        case 'music-controls-play':
          console.log('music-controls-play')
          this.togglePlayer(this.isPlaying$.value);
          break;
        case 'music-controls-destroy':
          console.log('music-controls-destroy')
          // Do something
          break;

        // External controls (iOS only)
        case 'music-controls-toggle-play-pause':
          this.togglePlayer(this.isPlaying$.value);
          // Do something
          break;
        case 'music-controls-seek-to':
          const seekToInSeconds = JSON.parse(action).position;
          MusicControls.updateElapsed({
            elapsed: seekToInSeconds,
            isPlaying: true
          });
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
          this.togglePlayer(this.isPlaying$.value);
          break;
        }
        default:
          break;
      }
    });
  }
  //===================================



  private upload() {
    if (!this.player) return;
    this.player.unload();
  }

  ngOnDestroy() {
    console.log('destroy')
    MusicControls.destroy(onSuccess => { }, onError => { });
    this.upload();
    this.id = null;
  }

  ngOnInit() {
    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {
      this.segments = segments;
      this.getPlayList();
    });

    this.isUpdateProgress$.safeSubscribe(this, (r) => {
      if (!r) {
        clearInterval(this.timeOutId);
      }
    });

    this.isPlaying$.pipe(distinctUntilChanged()).safeSubscribe(this, (playing) => {
      MusicControls.updateDismissable(!playing);
      //console.log('updateDismissable: ', !playing);
    });

    this.fileService.getFileList().safeSubscribe(this, files => {
      if (!files) return;
      this.playlist.forEach(f => {
        f.isDownload = files.some((fileInFolder) => fileInFolder.name === this.fileService.getFileNameFromSrc(f.src));
      });
    });
  }
}
