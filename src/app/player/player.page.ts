import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { BaseComponent } from '../services/base-component';
import { MusicControlService } from '../services/music-control.service';
import { DataService } from '../services/data.service';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { FormControl } from '@angular/forms';
import { FilesService } from '../services/files.service';
import { ServicePlayListModel, PlayListModel, ServiceModel } from '../backend/interfaces';
import { SettingsService } from '../services/settings.service';
import { NetworkService } from '../services/network.service';
import { AlertController } from '@ionic/angular';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage extends BaseComponent implements OnInit, OnDestroy {
  playlistToDownload: PlayListModel[] = [];
  playlist: PlayListModel[] = [];
  segments: UrlSegment[];
  secretName = new FormControl('');
  secretNameWarning: string = '';
  servicePlayList: ServicePlayListModel = { main: [], additional: {} }
  currentIndex = -1;
  playlistAreSame: boolean;
  params = [];
  service: ServiceModel;
  private subscription: any;

  constructor(private musicControlService: MusicControlService, private activatedRoute: ActivatedRoute,
    private dataService: DataService, private fileService: FilesService, private settingsService: SettingsService,
    private networkService: NetworkService, private alertController: AlertController) {
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

  private getDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [year, month, day];
  }

  private buildComputedPlayList(playList: ServicePlayListModel, year, month, day, radasteyaId, zituordId, secretNameIndexes = []) {
    if (!playList) return [];
    if (!playList.main) return [];

    let newPlayList: Array<PlayListModel> = [];
    playList.main.forEach(main => {
      if (main.id) {
        let tempArr = []
        switch (main.condition) {
          case 'year': // 2020
            tempArr = playList.additional[main.id][year];
            break;
          case 'month': // 09
            tempArr = playList.additional[main.id][month];
            break;
          case 'day': //01
            tempArr = playList.additional[main.id][day];
            break;
          case 'date': // "2020-12-01"
            let fullDate = [year, month, day].join('-');
            tempArr = playList.additional[main.id][fullDate];
            break;
          case 'dayMonth': // 01-31
            let monthDay = [month, day].join('-');
            tempArr = playList.additional[main.id][monthDay];
            break;
          case 'number':
            if (main.id === 'zituord') {
              tempArr = playList.additional[main.id][Number(zituordId)];
            } else
              if (main.id === 'radasteya') {
                tempArr = playList.additional[main.id][Number(radasteyaId)];
              }
            break;
        }
        if (tempArr) {
          tempArr.forEach(item => {
            newPlayList.push({
              id: main.id,
              isDownload: false,
              name: item.name ? item.name : main.name,
              path: item.path,
              condition: main.condition
            });
          });
        }
      } else {
        // copy object for distinctUntilChanged
        newPlayList.push({
          id: main.id,
          isDownload: main.isDownload,
          name: main.name,
          path: main.path,
          condition: main.condition
        });
      }
    });

    secretNameIndexes.forEach(index => {
      let t = playList.additional.secretName[index];
      if (t) {
        t.forEach(item => {
          newPlayList.push({
            id: '',
            isDownload: false,
            name: item.name,
            path: item.path,
            condition: ''
          });
        });
      }
    })
    return newPlayList;
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
        this.settingsService.getServicePlayListFromStorage(this.service, this.params);
        this.settingsService.getServicePlayList(this.service, this.params);
      }

      this.musicControlService.getCurrentIndex().safeSubscribe(this, (index) => {
        this.currentIndex = index;
      });

      this.musicControlService.playlistAreSame.safeSubscribe(this, (same) => {
        this.playlistAreSame = same;
      });

      this.subscription = this.settingsService.getServicePlayListAsync(this.service.id)
        .pipe(distinctUntilChanged((prev, curr) => {
          return JSON.stringify(prev) === JSON.stringify(curr);
        }))
        .safeSubscribe(this, async (servicePlayList: ServicePlayListModel) => {
          this.servicePlayList = servicePlayList;
          console.log('getServicePlayListAsync')

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
    });
  }

  private getPlayList(servicePlayList: ServicePlayListModel, secretNameArray = []) {
    this.playlistToDownload = [];
    const date = this.getDate();
    this.playlist = this.buildComputedPlayList(servicePlayList, date[0], date[1], date[2], this.params[0], this.params[1], secretNameArray);
    // console.log(this.playlist)
    this.playlistToDownload = this.service.loadAll || this.service.id === 3 // (key coord)
      ? this.dataService.getFilesToDownloads(this.service, servicePlayList)
      : this.playlist;
    console.log(this.playlist);
    this.musicControlService.setPlayList(this.playlist, this.service.name);
    this.fileService.getFileList().safeSubscribe(this, files => {
      if (!files)
        return;
      this.playlist.forEach(f => {
        f.isDownload = files.some((fileInFolder) => fileInFolder.name === this.fileService.getFileNameFromSrc(f.path));
      });
    });
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
