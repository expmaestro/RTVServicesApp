import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService, PlayListModel } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { Media, MediaObject, MEDIA_STATUS, MediaError, MEDIA_ERROR } from '@ionic-native/media/ngx';
import { BehaviorSubject, Subscription } from 'rxjs';
import { BaseComponent } from '../services/base-component';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage extends BaseComponent implements OnInit, OnDestroy {
  playlist: PlayListModel[] = [];
  typeId = 0;
  segments: UrlSegment[];
  secretName = new FormControl('');
  secretNameWarning: string = '';
  file: MediaObject;
  isStopped = true;
  currentIndex = 0;
  onSucessSubscribe$: Subscription;
  firstRun = true;
  stopAudio = false;

  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private fileService: FilesService,
    private media: Media,
    private changeRef: ChangeDetectorRef) {
    super();
    this.platform.ready().then(() => {
      if (this.platform.is("android") || this.platform.is("ios")) {
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

  play(index) {

    // if (!playNext) {
    //   this.stop();
    // }
    this.firstRun = true;
    if (this.isStopped) {
      this.initPlayer(index);
    } else {
      this.currentIndex = index;
      this.stop(false);
    }
    // this.onSucessSubscribe$ = this.file.onSuccess.subscribe((res) => {

    //   console.log(`music onSuccess end`);
    //   // this.file.release();
    // });


  }

  private initPlayer(index: number) {
    if (this.currentIndex + 1 >= this.playlist.length) return;

    this.currentIndex = this.firstRun ? index : index + 1;
    this.firstRun = false;
    this.changeRef.detectChanges();

    const fileName = this.playlist[this.currentIndex].src.split('/').pop(); //duplicate
    // const filePath = this.fileService.getFullFilePath(fileName.pop());//duplicate
    //  console.log(filePath);
    // console.log(fileName);
    //'https://s64408.cdn.ngenix.net/ngenix/audio/ozarin/polotno.mp3'
    //https://s64408.cdn.ngenix.net/ngenix/coord/rasstoyanie_v_stradastey/stradasteyaDistance.mp3
    this.file = this.media.create(this.fileService.getFullFilePath(fileName));
    this.onSucessSubscribe$ = this.file.onStatusUpdate.safeSubscribe(this, (status: MEDIA_STATUS) => {
      switch (status) {
        case 1: // STARTING
          break;
        case 2:   // 2: RUNNING(playing) 
          break;
        case 3:   // 3: PAUSED
          break;
        case 4:   // 4: STOPPED
          if (!this.stopAudio) {
            this.isStopped = true;
            this.initPlayer(this.currentIndex);
          }
          break;
        default:
          break;
      }
      console.log(MEDIA_STATUS[status]);
    }, (error) => console.log(error));

    this.file.play({ playAudioWhenScreenIsLocked: true });
    this.isStopped = false;

    // get file duration
    setTimeout(() => {
      let duration = this.file.getDuration();
      console.log('duration: ' + duration);
    }, 2000)

    this.file.getCurrentPosition().then((position) => {
      // console.log(position); 
    });

    this.file.onError.safeSubscribe(this, (error) => {
      console.log(error);
    });
  }

  pause() {
    console.log('pause');
    this.file.pause();
    let duration = this.file.getDuration();
    console.log(duration);
    this.file.getCurrentPosition().then((position) => {
      console.log(position);
    });
  }

  stop(stop) {
    this.stopAudio = stop;
    if (!this.file) return;
    //debugger;
    this.file.stop();
    this.file.release();
  }

  prev() {

  }
  next() {

  }

  ngOnDestroy() {
    console.log('destroy player');
    if (this.onSucessSubscribe$) {
      this.onSucessSubscribe$.unsubscribe();
    }
    if (this.file) {
      this.stop(true)
    }
  }

  ngOnInit() {
    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {
      this.segments = segments;
      this.getPlayList();
    });
  }
}
