import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { BaseComponent } from '../services/base-component';
import { MusicControlService, StreamState } from '../services/music-control.service';
import { DataService } from '../services/data.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { FilesService } from '../services/files.service';
import { ServicePlayListModel, PlayListModel, ServiceModel, ServicePlayListModelObject } from '../backend/interfaces';
import { SettingsService } from '../services/settings.service';
import { NetworkService } from '../services/network.service';
import { AlertController, Platform, NavController } from '@ionic/angular';
import { distinctUntilChanged, filter, takeUntil, take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage extends BaseComponent implements OnInit, OnDestroy {
  playlistToDownload$ = new BehaviorSubject<PlayListModel[]>([]);
  playlist: PlayListModel[] = [];
  segments: UrlSegment[];
  secretName = new FormControl('');
  showPassword = false;
  servicePlayList: ServicePlayListModelObject;
  currentIndex = -1;
  playlistAreSame: boolean = undefined;
  params: number[] = [];
  service: ServiceModel;
  private subscription: any;
  private profileSubscription: any;
  private samePlaylistSubscription: any;
  title = '';
  matrix = '';
  state: StreamState;
  buttonText = '';

  constructor(private musicControlService: MusicControlService, private activatedRoute: ActivatedRoute,
    private dataService: DataService, private fileService: FilesService, private settingsService: SettingsService,
    private networkService: NetworkService, private alertController: AlertController, private platform: Platform,
    private nav: NavController) {
    super();
    console.log('Player: ctor');
  }

  setSecretName() {
    console.log('setSecretName')
    const secretNameArray = [];
    const letters: string[] = ["а", "о", "у", "я", "и", "е", "ы", "ъ", "ь", "р"];
    const noLetters = [...letters]
    const input: string = this.secretName.value.toLowerCase();

    for (var i = 0; i < input.length; i++) {
      if (letters.indexOf(input[i]) != -1) {
        secretNameArray.push(letters.indexOf(input[i]) + 1);
        noLetters.splice(noLetters.indexOf(input[i]), 1)
      }
    }
    if (noLetters.length > 0) {
      this.secretName.setErrors({ warning: `Вы не ввели буквы: ${noLetters.join(', ')}` });
    }
    if (!this.secretName.valid) return;
    this.getPlayList(this.servicePlayList, secretNameArray);
    this.play(0);
  }

  public play(index) {
    this.musicControlService.runTrack$.next(index);
  }

  private async noNetworkConnection(message: string) {
    const alert = await this.alertController.create({
      header: 'Ошибка',
      message: message,
      buttons: [
        {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }
  otherTimeRedirect() {
    this.nav.navigateRoot("/services/1");
  }

  ngOnInit() {
    console.log('Player Init');
    this.musicControlService.getState()
      .safeSubscribe(this, state => {
        this.state = state;
      });

    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {
      this.segments = segments;
      if (this.segments.length > 0) {
        const serviceId = Number(this.segments[0].path);
        this.service = this.dataService.getService(serviceId);
        this.params = this.segments.filter((param, index) => index > 0).map((x) => Number(x.path));
        this.title = this.dataService.getFullSectionName(this.service, this.params);

        this.settingsService.getServicePlayListFromStorage(this.service.id);
        this.settingsService.getServicePlayList(this.service.id);
      }

      this.musicControlService.getCurrentIndex().safeSubscribe(this, (index) => {
        this.currentIndex = index;       
      });

      this.samePlaylistSubscription = this.musicControlService.checkPlaylistAreSameAsync.safeSubscribe(this, (same) => {
        this.playlistAreSame = same;
       // console.log(same)
        console.log( ' this.musicControlService.checkPlaylistAreSameAsync.pipe(distinctUntilChanged())')
      });
    });
  }

  showDownload() {
    if (this.service?.id === 3 && this.playlist.length > 0) return false;
    return this.service?.id !== 1 && this.service?.id !== 2 && this.service?.id !== 5;
  }

  private getPlayList(servicePlayList: ServicePlayListModelObject, secretNameArray = []) {
    let playlistToDownload = [];
    let key = ''
    if (this.service.id === 5) {
      key = `${this.service.id}.1-1`;
    } else {
      key = `${this.service.id}.${this.params.length > 0 ? this.params.join('-') : '1-1'}`;
    }
    let subServicePlayList: ServicePlayListModel = servicePlayList[key];
    //if(this.)

    // console.log(this.playlist)

    playlistToDownload = this.dataService.getFilesToDownloads(this.service, servicePlayList);
    // console.table(this.playlistToDownload.map(m => m.path));
    this.playlistToDownload$.next(playlistToDownload);
    if (this.service.id === 3 && secretNameArray.length === 0) return;
   // console.log(playlistToDownload);
    this.playlist = this.dataService.buildComputedPlayList(subServicePlayList, this.params[0], this.params[1], this.params[2], secretNameArray);
  //  console.log('!!!!!!!!! Set play list')
    this.musicControlService.setPlayList(this.playlist, this.service, this.params);
    this.platform.ready().then(() => {
      this.fileService.updateFiles(this.service.id);
      this.fileService.getFileList(this.service.id).safeSubscribe(this, files => {
        if (!files) return;
        this.playlist.forEach(f => {
          f.isDownload = files.some((fileInFolder) => fileInFolder.name === this.fileService.getFileNameFromSrc(f.path));
        });
      });
    });

  }

  ionViewDidEnter() {
    this.subscription = this.settingsService.getServicePlayListAsync(this.service.id)
      .pipe(distinctUntilChanged((prev, curr) => {
        return JSON.stringify(prev) === JSON.stringify(curr);
      }))
      .safeSubscribe(this, async (servicePlayList: ServicePlayListModelObject) => {
        this.servicePlayList = servicePlayList;
        console.log('getServicePlayListAsync, serviceId ', this.service.id);
        console.log(servicePlayList)

        if (servicePlayList) {
          this.getPlayList(servicePlayList);
        }
        else {
          let isConneted = await this.networkService.pingApiRequest();
          if (!isConneted) {
            this.noNetworkConnection('Нет сети. Для того, чтобы продолжить подключитесь к сети');
          } else {

          }
        }
      });

    if (this.service.id === 3) {
      this.profileSubscription = this.settingsService.getProfileDataAsync.safeSubscribe(this, (r: any) => {
        this.matrix = r.matrix.value;
      });
    }
  }

  ionViewWillLeave() {
    console.log('Player: desroy');
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
      this.profileSubscription = null;
    }

    if (this.samePlaylistSubscription) {
      this.samePlaylistSubscription.unsubscribe();
      this.samePlaylistSubscription = null;
    }
  }

  ngOnDestroy() {
    console.log('Player: ng desroy')
  }
}
