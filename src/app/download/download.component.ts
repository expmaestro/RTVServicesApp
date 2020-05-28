import { Component, OnInit, Input } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { LoadingController, Platform, AlertController, ToastController } from '@ionic/angular';
import { FilesService } from '../services/files.service';
import { environment } from 'src/environments/environment';
import { File } from '@ionic-native/file/ngx';
import { BaseComponent } from '../services/base-component';
import { PlayListModel } from '../backend/interfaces';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent extends BaseComponent implements OnInit {
  @Input() public playlist;
  needToDownloadFiles: PlayListModel[] = [];
  fileTransferCreate: FileTransferObject;
  progress = 0;
  private loading: any;
  constructor(private fileTransfer: FileTransfer, private loadingCtrl: LoadingController,
    private platform: Platform, private fileService: FilesService, private file: File,
    private alertController: AlertController,
    private toastController: ToastController,
  ) {
    super();

  }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is("android") || this.platform.is("ios")) {
        //this.updateFileList();     
        this.fileTransferCreate = this.fileTransfer.create();
      }
    });
  }

  async download(playList = null) {
    // var networkState = navigator.connection.type;
    // console.log(networkState);
    this.needToDownloadFiles = playList ? playList : [...this.playlist]
    // this.needToDownloadFiles = [{
    //   src: 'http://speedtest.tis-dialog.ru/test10',
    //   title: "big-file1"
    // }]
    const download_retry = async (model, url: string, filePath: string, retryCount) => {

      for (let i = 0; i < retryCount; i++) {
        const t = Math.floor(Math.random() * 2);
        const url1 = url + (t > 0 ? '' : '');
        const filePath1 = filePath + (t > 0 ? '' : '');
        try {
          return await this.fileTransferCreate.download(url1, filePath1, false)
            .then(
              (entry) => {
                console.log("Successful download: " + url);
                //console.log("download complete: " + entry.toURL());
                this.progress = Math.round(100 / this.playlist.length * (this.playlist.length + 1 - this.needToDownloadFiles.length));
                this.loading.dismiss();
              }).catch((error1) => {
                console.log("=======================error========================");
                console.log("download error source " + error1.source);
                console.log("download error target " + error1.target);
                console.log("download error code: " + error1.code);
                console.log("download exception: " + error1.exception);
                console.log('download failed: ' + JSON.stringify(error1));
                throw (error1);
              })
        } catch (err) {
          console.log(i);
          const isLastAttempt = i + 1 === retryCount;
          if (isLastAttempt) {
            console.log('sorry we can not downoload this file: ' + model.title);
            throw err;
          }
        }

      }
    };

    const downloadPlayLsit = async () => {
      while (this.needToDownloadFiles.length > 0) {
        this.loading = await this.loadingCtrl.create({
          message: `Пожалуйста подождите...<br>Скачанно <b>${this.playlist.length + 1 - this.needToDownloadFiles.length} из ${this.playlist.length}</b> файлов`
        });

        await this.loading.present();
        const currentDownloaded = this.needToDownloadFiles[0];
        const fullUrl = environment.cdn + currentDownloaded.src;
        const filePath = this.fileService.getFullFilePath(this.fileService.getFileNameFromSrc(currentDownloaded.src));

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
            this.downloadFileError(`Не удается скачать файл: <b>${currentDownloaded.title}</b> <br> Причина: <b>${textError}</b>`);
          })
          .finally(() => this.loading.dismiss())
      }
    }

    await downloadPlayLsit()
      .finally(() => this.fileService.updateFiles());
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
