import { Component, OnInit, Input, NgZone, OnDestroy } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { Platform, AlertController } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { environment } from 'src/environments/environment';
import { File, Entry } from '@ionic-native/file/ngx';
import { BaseComponent } from '../services/base-component';
import { PlayListModel, ServiceEnum } from '../backend/interfaces';
import { DataService } from '../services/data.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent extends BaseComponent implements OnInit, OnDestroy {
  playlist: PlayListModel[] = [];
  @Input() oneFileMode: boolean;
  @Input() isDownload: boolean = undefined;
  @Input() set setPlaylist(value: PlayListModel[]) {
    this.playlist = value;
    console.log(this.type)
    if (value.length > 0 && !this.oneFileMode) {
      this.isPlaylistDownloaded();
    }
  }
  @Input() serviceId = 0;
  @Input() type = 0;
  description;
  needToDownloadFiles: PlayListModel[] = [];
  fileTransferCreate: FileTransferObject;
  progress = 0;
  size = 0;
  alreadyLoaded: boolean = undefined;
  isAndroid = false;
  isIos = false;
  constructor(private fileTransfer: FileTransfer,
    private platform: Platform, private fileService: FilesService, private file: File,
    private alertController: AlertController,
    private zone: NgZone, private dataService: DataService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is("android")) { this.isAndroid = true; }
      if (this.platform.is("ios")) { this.isIos = true; }
      //   if (this.platform.is("android") || this.platform.is("ios")) {
      this.fileTransferCreate = this.fileTransfer.create();

      this.fileTransferCreate.onProgress(progress => {
        if (this.playlist && this.playlist.length === 1) {
          this.zone.run(() => {
            // console.log(progress);
            if (progress.lengthComputable) {
              // this.getFreeSpace().then(freeDiskSpace => {
              //   console.log(`${progress.total} - ${freeDiskSpace}`)
              //   if (freeDiskSpace > 0 && progress.total > (freeDiskSpace - 500 * 1024 * 1024)) {
              //     freeDiskSpace = 0;
              //     this.fileTransferCreate.abort();
              //     this.downloadFileError(`Недостаточно места для скачивания файла`, false);
              //   }
              // });
              this.progress = Math.round(progress.loaded / progress.total * 100);
            }
            else {
              //console.log(progress.loaded / 1024 / 1024);
            }
          });
        }
      });
      // }
    });
  }

  ngOnDestroy() {
    this.cancelDownload();
  }

  isPlaylistDownloaded() {
    // platform ?
    this.fileService.getFileListFromFolder(this.fileService.getAudioFolder + `/${this.serviceId}`).then((f) => {
      let files: Entry[] = f;
      this.playlist.forEach(f => {
        f.isDownload = files.some((fileInFolder) => fileInFolder.name === this.fileService.getFileNameFromSrc(f.path));
      });
      this.alreadyLoaded = this.playlist.length > 0 && this.playlist.every(e => e.isDownload);
      this.description = this.sanitizer.bypassSecurityTrustHtml(this.setDescription());
      console.log('check ' + this.playlist.length);
    });
    this.file.resolveDirectoryUrl(this.file.dataDirectory + this.fileService.getAudioFolder + `/${this.serviceId}`).then(x => {
      this.fileService.directorySize(x)
        .then((s) => (this.size = s / 1024 / 1024))
        .catch(() => this.size = 0);
    }).catch(() => this.size = 0);
  };

  deleteMusic() {
    console.log('delete ' + this.serviceId);
    this.clear(true);
  }

  cancelDownload() {
    if (this.needToDownloadFiles.length > 0) {
      console.log('cancel, destroy');
      this.fileTransferCreate.abort();
      this.clear();
    }
  }

  cancelOneFileDownload() {
    this.fileTransferCreate.abort();
  }


  private getFreeSpace() {
    return this.file.getFreeDiskSpace().then(result => {
      if (this.isAndroid) {
        return (result * 1024);
      }
      if (this.isIos) {
        return result;
      }
      return 0;
    });
  }

  private setDescription() {
    if (this.type === ServiceEnum.service) {
      if (this.serviceId === 1) {
        const date = this.dataService.getDate();
        const stringDate = `${date[2]}.${date[1]}.${date[0]}`;
        return this.alreadyLoaded
          ? `Завод времени на ${stringDate} загружен. <ion-icon name="checkmark-circle-outline"></ion-icon> <br>Можно слушать без интернета.`
          : `Загрузить завод времени на ${stringDate} для прослушивания без интернета`;
      } else if (this.serviceId === 2) {
        return this.alreadyLoaded
          ? `Сервис загружен. <ion-icon name="checkmark-circle-outline"></ion-icon> <br>Можно слушать без интернета.`
          : 'Загрузить подъём и опускание черпачков для прослушивания без интернета';
      } else {
        return this.alreadyLoaded
          ? `Сервис загружен. <ion-icon name="checkmark-circle-outline"></ion-icon> <br>Можно слушать без интернета.`
          : 'Загрузить сервис для прослушивания без интернета';
      }
    } else if (this.type === ServiceEnum.audio) {
      return this.alreadyLoaded
        ? `Треки загружены. <ion-icon name="checkmark-circle-outline"></ion-icon> <br>Можно слушать без интернета.`
        : 'Загрузить треки для прослушивания без интернета';
    }


  }

  async download() {
    this.fileService
      .clear(this.serviceId, false)
      .then(() => this.downloadPlayList());
  }


  downloadOneFile(event) {
    this.downloadPlayList();
    event.preventDefault();event.stopPropagation()
  }

  async downloadPlayList(playList = null) {
    if (!playList) {
      this.progress = 0;
    }


    // var networkState = navigator.connection.type;
    // console.log(networkState);
    this.needToDownloadFiles = playList ? playList : [...this.playlist]
    // this.needToDownloadFiles = [{
    //   src: 'http://speedtest.tis-dialog.ru/test10',
    //   title: "big-file1"
    // }]
    const download_retry = async (model: PlayListModel, url: string, folderPath: string, fileName: string, retryCount) => {
      const filePath = folderPath + fileName;
      for (let i = 0; i < retryCount; i++) {
        const t = Math.floor(Math.random() * 2); // Just for error test
        const url1 = url + (t > 0 ? '' : '');
        const filePath1 = filePath + (t > 0 ? '' : '');
        console.log(filePath1)
        try {
          return await this.fileTransferCreate.download(url1, filePath1, false)
            .then(
              async (entry) => {
                await this.file.moveFile(folderPath, fileName, folderPath, fileName.replace('_start', ''))
                if (this.oneFileMode) {
                  this.isDownload = true;
                }
                model.isDownload = true;
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
          if (error.code === 4) { //when user canceled download
            console.log(' user canceled download');
            //  this.needToDownloadFiles = [];
            throw error;
          }
          if (error.code === 3 && error.exception && error.exception.includes('ENOSPC')) {
            throw error;
          }
          console.log(i);
          const isLastAttempt = i + 1 === retryCount;
          if (isLastAttempt) {
            console.log('sorry we can not downoload this file: ' + model.name);
            throw error;
          }
        }
      }
    };

    const downloadPlayList = async () => {
      while (this.needToDownloadFiles.length > 0) {
        const currentDownloaded = this.needToDownloadFiles[0];
        const fullUrl = (currentDownloaded.path.includes('https') ? '' : environment.cdn) + currentDownloaded.path;
        const fileName = this.fileService.getFileNameFromSrc(currentDownloaded.path) + '_start';
        // const filePath = this.fileService.getFullFilePath(this.serviceId, fileName) + '_start';
        const fullFolderPath = this.fileService.getFullFolderPath(this.serviceId);

        return await download_retry(currentDownloaded, fullUrl, fullFolderPath, fileName, 3)
          .then(async (t) => {
            // console.log(7777777777777777777)
            this.needToDownloadFiles.shift();
            await downloadPlayList();
          })
          .catch((e) => {
            let textError = '';
            switch (e.code) {
              case 1: textError = 'Файл не найден на сервере'; break; // FileTransferError.FILE_NOT_FOUND_ERR Сервер не доступен либо файл не найден на сервере
              case 2: textError = 'INVALID_URL_ERR'; break; // FileTransferError.INVALID_URL_ERR
              case 3:  // FileTransferError.CONNECTION_ERR

                if (e.exception && e.exception.includes('ENOSPC')) {
                  textError = 'Недостаточно места';
                  throw 'ENOSPC';
                } else
                  if (e.exception && e.exception.includes('Unable to resolve')) {
                    textError = 'Нет соединения с сервером';
                    //Нет соединения, или недостаточно места
                  } else if (e.exception && e.exception.includes('Connection reset by peer')) {
                    textError = 'Сервер разорвал соединение';
                  }

                break;
              case 4: // FileTransferError.ABORT_ERR
                throw 'ABORT_ERR';
              case 5: textError = 'NOT_MODIFIED_ERR'; break;  // FileTransferError.NOT_MODIFIED_ERR
              default: break;
            }
            this.downloadFileError(`Не удается скачать файл: <b>${currentDownloaded.name}</b> <br> Причина: <b>${textError}</b>`);
          })
          .catch(e => {
            if (e === 'ABORT_ERR') {
              this.needToDownloadFiles = [];
              console.log('User canceled download');
            }
            if (e === 'ENOSPC') {
              this.downloadFileError(`Не удается скачать файл: <b>${currentDownloaded.name}</b> <br> Причина: <b>Недостаточно места</b>`, false);
            }
          })
          .finally(() => {
          })
      }
    }

    await downloadPlayList()
      .finally(() => {
        this.fileService.updateFiles(this.serviceId);
        this.alreadyLoaded = undefined; // remove small lag
        this.isPlaylistDownloaded();
      });
  }


  clear(showLoader = false) {
    this.fileService
      .clear(this.serviceId, showLoader).then(() => {
        this.needToDownloadFiles = [];
        this.fileService.updateFiles(this.serviceId);
        this.isPlaylistDownloaded();
      })
  }

  private async downloadFileError(message: string, showRetry = true) {

    let buttons = [];

    buttons.push({
      text: 'Отменить',
      role: 'cancel',
      cssClass: 'secondary',
      handler: () => {
        console.log('Confirm Cancel');
        this.clear();
      }
    })

    if (showRetry) {
      buttons.push({
        text: 'Повторить',
        handler: () => {
          console.log('Confirm Ok');
          this.downloadPlayList(this.needToDownloadFiles);
        }
      })
    }

    const alert = await this.alertController.create({
      header: 'Ошибка',
      message: message,
      buttons: buttons
    });

    await alert.present();
  }

}
