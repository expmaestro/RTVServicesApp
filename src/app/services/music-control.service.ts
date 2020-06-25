import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { SectionPlayList, ServiceModel } from '../backend/interfaces';

@Injectable({
  providedIn: 'root'
})
export class MusicControlService {

  private playlist$ = new Subject<SectionPlayList>();
  private currentIndex$ = new BehaviorSubject<number>(-1);
  runTrack$ = new Subject<number>(); // auto start from 0
  private playlistAreSame$ = new Subject<boolean>();

  get getPlaylist() {
    return this.playlist$.asObservable();
  }

  setPlayList(playList, service: ServiceModel, params: number[]): void {
    this.playlist$.next({  playList: playList, service: service,  params});
  }

  get currentIndex() {
    return this.currentIndex$.value;
  }

  setCurrentIndex(value) {
    this.currentIndex$.next(value)
  }

  getCurrentIndex() {
    return this.currentIndex$.asObservable();
  }

  setPlaylistAreSame(val: boolean) {
    this.playlistAreSame$.next(val);
  }

  get checkPlaylistAreSameAsync() {
    return this.playlistAreSame$.asObservable();
  }

  constructor() { }

  private stop$ = new Subject();
  private audioObj = new Audio();
  audioEvents = [
    'loadstart', 'durationchange', 'ended', 'error', 'play', 'playing', 'pause', 'timeupdate', 'canplay', 'loadedmetadata',
  ];
  private state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
  };

  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);

  private streamObservable(url): Observable<any> {
    return new Observable(observer => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        // reset state
        this.resetState();
      };
    });
  }

  private addEvents(obj, events, handler) {
    events.forEach(event => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach(event => {
      obj.removeEventListener(event, handler);
    });
  }

  playStream(url) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next();
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }

  // formatTime(time: number, format: string = 'HH:mm:ss') {
  //   const momentTime = time * 1000;
  //   return moment.utc(momentTime).format(format);
  // }


  formatTime(d) {
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

  private updateStateEvents(event: Event): void {
    //console.log(event.type)
    switch (event.type) {
      case 'durationchange':
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        break;
      case 'canplay':
        this.state.canplay = true;
        break;
      case 'play':
        console.log('play');
        break;
      case 'playing':
        this.state.playing = true;
        break;
      case 'pause':
        this.state.playing = false;
        console.log('pause');
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
      case 'ended':
        console.log('ended');
        break;
    }
    this.stateChange.next(this.state);
  }

  resetState() {
    this.state = this.initState();
  }

  private initState(): StreamState {
    return {
      playing: false,
      readableCurrentTime: '00:00',
      readableDuration: '00:00',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false
    };
  }

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }


  mediaControlSettings(sectionName, trackName, isPlaying, dismissable, cover) {
    return { 
      track: sectionName,		// optional, default : ''
      artist: trackName,// 'Muse',						// optional, default : ''
      album: trackName,     // optional, default: ''
      cover: cover,		// optional, default : nothing
      // cover can be a local path (use fullpath 'file:///storage/emulated/...', or only 'my_image.jpg' if my_image.jpg is in the www folder of your app)
      //			 or a remote url ('http://...', 'https://...', 'ftp://...')
      isPlaying: isPlaying,							// optional, default : true
      dismissable: dismissable,							// optional, default : false

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
      notificationIcon: 'ic_icon'
    }
  }
}


export interface StreamState {
  playing: boolean;
  readableCurrentTime: string;
  readableDuration: string;
  duration: number | undefined;
  currentTime: number | undefined;
  canplay: boolean;
  error: boolean;
}

