import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService, PlayListModel } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { Platform, LoadingController, AlertController, IonRange } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { BehaviorSubject, Subscription, from } from 'rxjs';
import { BaseComponent } from '../services/base-component';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { environment } from 'src/environments/environment';
import { NetworkService } from '../services/network.service';
import { LoadingService } from '../services/loading.service';
import { Howl } from 'howler';

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
  isStopped = true;
  currentIndex = -1;
  stopAudio = false;
  duration = 0;
  seekTime = 0;
  progress: FormControl = new FormControl('expmaestro');
  private win: any = window;
  id = null;
  private platformReady = false;

  player: Howl = null;
  isPlaying = false;

  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private platform: Platform,
    private loadingService: LoadingService,
    private fileService: FilesService,
    private changeRef: ChangeDetectorRef,
    private musicControl: MusicControls,
    private networkService: NetworkService) {
    super();
    this.platform.ready().then(() => {
      if (
        this.platform.is("android") ||
        this.platform.is("ios")) {
        // this.platformReady = true; //TODO: remove this
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
    if (index > this.playlist.length - 1) return; //auto stop
    if (stopInTheEnd && index === 0) {
      this.currentIndex = -1;
      return;
    }

    if (this.isPlaying) {
      this.upload();
    }

    this.currentIndex = index;
    this.changeRef.detectChanges();
    const src = this.playlist[this.currentIndex].src;
    const fileName = src.split('/').pop(); //duplicate
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
        console.log('onplayerror')
      },
      onplay: () => {
        console.log('onPlay');
        this.isPlaying = true;
        this.duration = this.player.duration();
        this.updateProgress();
      },
      onend: () => {
        this.next(true);
        console.log('onEnd');
      },
      onpause: () => {
        console.log('onpause');
      },
      onstop: () => {
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
    this.isPlaying = !pause;
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
    if (!d) return '00:00';
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
    let val = this.duration * (newValue) / 10000;
    this.player.seek(val)
  }

  updateProgress() {
    if (!this.id) return;
    let seekTime = this.player.seek();
    if (typeof seekTime === 'number') {
      this.seekTime = seekTime;
      this.progress.setValue((this.seekTime / this.duration) * 10000 || 0)
    }

    setTimeout(() => {
      this.updateProgress()
    }, 300)
  }

  prev() {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
    this.play(this.currentIndex);
  }

  next(stopInTheEnd = false) {
    this.currentIndex = this.currentIndex + 1 >= this.playlist.length ? 0 : this.currentIndex + 1;
    this.play(this.currentIndex, stopInTheEnd);
  }


  prevOld() {
    this.currentIndex = this.currentIndex - 1 >= 0 ? this.currentIndex - 1 : this.playlist.length - 1;
    this.play(this.currentIndex);
    // console.log(this.currentIndex);
  }

  nextOld() {
    this.currentIndex = this.currentIndex + 1 >= this.playlist.length ? 0 : this.currentIndex + 1;
    this.play(this.currentIndex);
    console.log(this.currentIndex);
  }

  musicControlSettings() {
    this.musicControl.create({
      track: 'Time is Running Out',		// optional, default : ''
      artist: 'Muse',						// optional, default : ''
      album: 'Absolution',     // optional, default: ''
      cover: 'albums/absolution.jpg',		// optional, default : nothing
      // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
      //			 or a remote url ('http://...', 'https://...', 'ftp://...')
      isPlaying: true,							// optional, default : true
      dismissable: true,							// optional, default : false

      // hide previous/next/close buttons:
      hasPrev: false,		// show previous button, optional, default: true
      hasNext: false,		// show next button, optional, default: true
      hasClose: true,		// show close button, optional, default: false

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
      ticker: 'Now playing "Time is Running Out"',
      //All icons default to their built-in android equivalents
      //The supplied drawable name, e.g. 'media_play', is the name of a drawable found under android/res/drawable* folders
      playIcon: 'media_play',
      pauseIcon: 'media_pause',
      prevIcon: 'media_prev',
      nextIcon: 'media_next',
      closeIcon: 'media_close',
      notificationIcon: 'notification'
    });

    // const onSuccess = (r) => {
    //   console.log(r)
    // }
  }

  private upload() {
    if (!this.player) return;
    this.player.unload();
  }

  ngOnDestroy() {
    this.upload();
    this.id = null;
  }

  ngOnInit() {
    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {
      this.segments = segments;
      this.getPlayList();
    });
  }
}
