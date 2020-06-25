import { Component, OnInit, Input, NgZone } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { environment } from 'src/environments/environment';
import { File } from '@ionic-native/file/ngx';
import { BaseComponent } from '../services/base-component';
import { PlayListModel } from '../backend/interfaces';
import { DataService } from '../services/data.service';

@Component({
  selector: 'download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent extends BaseComponent implements OnInit {
  playlist: PlayListModel[] = [];
  @Input() set setPlaylist(value: PlayListModel[]) {
    this.playlist = value;
    console.log(value.length);
    if (value.length > 0) {
      this.isPlaylistDownloaded();
    }
  }
  @Input() serviceId = 0;
  description = '';
  needToDownloadFiles: PlayListModel[] = [];
  fileTransferCreate: FileTransferObject;
  progress = 0;
  alreadyLoaded: boolean = undefined;
  constructor(private fileTransfer: FileTransfer,
    private platform: Platform, private fileService: FilesService, private file: File,
    private alertController: AlertController,
    private zone: NgZone, private dataService: DataService
  ) {
    super();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is("android") || this.platform.is("ios")) {
        this.fileTransferCreate = this.fileTransfer.create();
        this.fileTransferCreate.onProgress(progress => {
          if (this.playlist && this.playlist.length === 1) {
            this.zone.run(() => {
              this.progress = Math.round(progress.loaded / progress.total * 100);
            });
          }
        });
      }
    });
  }

  isPlaylistDownloaded() {
    this.fileService.getFileListFromFolder(this.fileService.getAudioFolder + `/${this.serviceId}`).then((f) => {
      let files = f;
      this.playlist.forEach(f => {
        f.isDownload = files.some((fileInFolder) => fileInFolder.name === this.fileService.getFileNameFromSrc(f.path));
      });
      this.alreadyLoaded = this.playlist.length > 0 && this.playlist.every(e => e.isDownload);
      this.setDescription();
      console.log('check ' + this.playlist.length);
    });
  }

  deleteMusic() {
    console.log('delete ' + this.serviceId);
    this.fileService.clear(this.serviceId).then(t => this.isPlaylistDownloaded());
  }

  private setDescription() {
    if (this.serviceId === 1) {
      const date = this.dataService.getDate();
      const stringDate = `${date[2]}.${date[1]}.${date[0]}`;
      this.description = this.alreadyLoaded
        ? `Завод времени на ${stringDate} загружен.`
        : `Загрузить завод времени на ${stringDate} для прослушивания без интернета`;
    } else if (this.serviceId === 2) {
      this.description = this.alreadyLoaded
        ? `Сервис загружен. <br>Можно слушать без интернета.`
        : 'Загрузить подъём и опускание черпачков для прослушивания без интернета';
    } else {
      this.description = this.alreadyLoaded
        ? `Сервис загружен`
        : 'Загрузить сервис для прослушивания без интернета';
    }

  }

  async download(playList = null) {
    if (!playList) {
      // this.isLoading = true;
      this.progress = 0;
    }

    // var networkState = navigator.connection.type;
    // console.log(networkState);
    this.needToDownloadFiles = playList ? playList : [...this.playlist]
    // this.needToDownloadFiles = [{
    //   src: 'http://speedtest.tis-dialog.ru/test10',
    //   title: "big-file1"
    // }]
    const download_retry = async (model: PlayListModel, url: string, filePath: string, retryCount) => {

      for (let i = 0; i < retryCount; i++) {
        const t = Math.floor(Math.random() * 2); // Just for error test
        const url1 = url + (t > 0 ? '' : '');
        const filePath1 = filePath + (t > 0 ? '' : '');
        try {
          return await this.fileTransferCreate.download(url1, filePath1, false)
            .then(
              (entry) => {
                console.log("Successful download: " + url);
                //console.log("download complete: " + entry.toURL());
                this.progress = Math.round(100 / this.playlist.length * (this.playlist.length + 1 - this.needToDownloadFiles.length));
              }).catch((error) => {
                console.log("=======================error========================");
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("download error code: " + error.code);
                console.log("download exception: " + error.exception);
                console.log('download failed: ' + JSON.stringify(error));
                throw (error);
              })
        } catch (error) {
          console.log(i);
          const isLastAttempt = i + 1 === retryCount;
          if (isLastAttempt) {
            console.log('sorry we can not downoload this file: ' + model.name);
            throw error;
          }
        }
      }
    };

    const downloadPlayLsit = async () => {
      while (this.needToDownloadFiles.length > 0) {
        const currentDownloaded = this.needToDownloadFiles[0];
        const fullUrl = environment.cdn + currentDownloaded.path;
        const filePath = this.fileService.getFullFilePath(this.serviceId, this.fileService.getFileNameFromSrc(currentDownloaded.path));

        return await download_retry(currentDownloaded, fullUrl, filePath, 3)
          .then(async (t) => {
            this.needToDownloadFiles.shift();
            await downloadPlayLsit();
          })
          .catch((e) => {
            console.log('popup');
            let textError = '';
            switch (e.code) {
              case 1: textError = 'Файл не найден на сервере'; break; // FileTransferError.FILE_NOT_FOUND_ERR Сервер не доступен либо файл не найден на сервере
              case 2: textError = 'INVALID_URL_ERR'; break; // FileTransferError.INVALID_URL_ERR
              case 3:

                if (e.exception && e.exception.includes('ENOSPC')) {
                  textError = 'Недостаточно места';
                } else
                  if (e.exception && e.exception.includes('Unable to resolve')) {
                    textError = 'Нет соединения с сервером';
                    //Нет соединения, или недостаточно места
                  } else if (e.exception && e.exception.includes('Connection reset by peer')) {
                    textError = 'Сервер разорвал соединение';
                  }

                break; // FileTransferError.CONNECTION_ERR
              case 4: textError = 'ABORT_ERR'; break; // FileTransferError.ABORT_ERR
              case 5: textError = 'NOT_MODIFIED_ERR'; break;  // FileTransferError.NOT_MODIFIED_ERR
            }
            this.downloadFileError(`Не удается скачать файл: <b>${currentDownloaded.name}</b> <br> Причина: <b>${textError}</b>`);
          })
          .finally(() => {
            //this.loading.dismiss()
          })
      }
    }

    await downloadPlayLsit()
      .finally(() => {
        this.fileService.updateFiles(this.serviceId);
        this.alreadyLoaded = undefined; // remove small lag
        this.isPlaylistDownloaded();
        //this.isLoading = false;
      });
  }


  private async downloadFileError(message: string) {
    const alert = await this.alertController.create({
      header: 'Ошибка',
      //subHeader: message,
      message: message,
      buttons: [
        {
          text: 'Отменить',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
            //this.isLoading = false;
            this.needToDownloadFiles = [];
          }
        }, {
          text: 'Повторить',
          handler: () => {
            console.log('Confirm Ok');
            this.download(this.needToDownloadFiles);
          }
        }
      ]
    });

    await alert.present();
  }

}
