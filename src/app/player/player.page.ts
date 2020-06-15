import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { BaseComponent } from '../services/base-component';
import { MusicControlService } from '../services/music-control.service';
import { DataService } from '../services/data.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { FormControl } from '@angular/forms';
import { FilesService } from '../services/files.service';
import { ServicePlayListModel, PlayListModel, ServiceModel, ServicePlayListModelObject } from '../backend/interfaces';
import { SettingsService } from '../services/settings.service';
import { NetworkService } from '../services/network.service';
import { AlertController, Platform } from '@ionic/angular';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
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
  secretNameWarning: string = '';
  servicePlayList: ServicePlayListModelObject;
  currentIndex = -1;
  playlistAreSame: boolean;
  params = [];
  service: ServiceModel;
  private subscription: any;

  constructor(private musicControlService: MusicControlService, private activatedRoute: ActivatedRoute,
    private dataService: DataService, private fileService: FilesService, private settingsService: SettingsService,
    private networkService: NetworkService, private alertController: AlertController, private platform: Platform) {
    super();
    console.log('Player: ctor');
  }

  setSecretName() {
    const secretNameArray = [];
    this.secretNameWarning = '';
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
      this.secretNameWarning = `Вы не ввели буквы: ${noLetters.join(', ')}`;
    }
    this.getPlayList(this.servicePlayList, secretNameArray);
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

  ngOnInit() {
    console.log('Player Init');
    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {
      this.segments = segments;
      if (this.segments.length > 0) {
        const serviceId = Number(this.segments[0].path);
        this.service = this.dataService.getService(serviceId)
        this.params = this.segments.filter((param, index) => index > 0).map((x) => Number(x.path));
        this.settingsService.getServicePlayListFromStorage(this.service.id, this.params);
        this.settingsService.getServicePlayList(this.service.id);
      }

      this.musicControlService.getCurrentIndex().safeSubscribe(this, (index) => {
        this.currentIndex = index;
      });

      this.musicControlService.playlistAreSame.safeSubscribe(this, (same) => {
        this.playlistAreSame = same;
      });
    });
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
    this.playlist = this.dataService.buildComputedPlayList(subServicePlayList, this.params[0], this.params[1], secretNameArray);
    // console.log(this.playlist)

    playlistToDownload = this.dataService.getFilesToDownloads(this.service, servicePlayList);
    // console.table(this.playlistToDownload.map(m => m.path));
    this.playlistToDownload$.next(playlistToDownload);
    console.log(playlistToDownload);
    this.musicControlService.setPlayList(this.playlist, this.service);
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
      })
  }

  ionViewWillLeave() {
    console.log('Player: desroy');
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  ngOnDestroy() {
    console.log('Player: ng desroy')
  }
}
