import { Component, OnInit, Input } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { LoadingController, Platform, AlertController } from '@ionic/angular';
import { PlayListModel } from '../services/data.service';
import { FilesService } from '../services/files.service';
import { environment } from 'src/environments/environment';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.scss'],
})
export class DownloadComponent implements OnInit {
  @Input() public playlist;
  fileListInFolder = [];
  needToDownloadFiles: PlayListModel[] = [];
  fileTransferCreate: FileTransferObject = this.fileTransfer.create();
  private loading: any;
  constructor(private fileTransfer: FileTransfer, private loadingCtrl: LoadingController, 
    private platform: Platform, private fileService: FilesService, private file: File, 
    private alertController: AlertController,) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is("android") || this.platform.is("ios")) {
        this.updateFileList();
      }
    });
  }

  updateFileList() {
    this.fileService.getFileList().then((r) => {
      this.fileListInFolder = r;
    });
  }

  async download(playList = null) {
    this.needToDownloadFiles = playList ? playList : [...this.playlist]
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
                this.loading.dismiss();
              }).catch((error1) => {
                console.log("=======================error========================");
                console.log("download error source " + error1.source);
                console.log("download error target " + error1.target);
                console.log("upload error code" + error1.code);
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
          message: `Пожалуйста подождите...<br>Скачанно <b>${this.playlist.length + 1 - this.needToDownloadFiles.length} из ${this.playlist.length + 1}</b> файлов`
        });
        await this.loading.present();
        const currentDownloaded = this.needToDownloadFiles[0];
        const fullUrl = environment.cdn + currentDownloaded.src;
        const fileName = currentDownloaded.src.split('/');
        const filePath = this.fileService.getPath(fileName.pop());

        return await download_retry(currentDownloaded, fullUrl, filePath, 3)
          .then(async (t) => {
            this.needToDownloadFiles.shift();
            await downloadPlayLsit();
          })
          .catch((e) => {
            console.log('popup');
            let textError = '';
            switch (e.code) {
              case 1: textError = 'Файл не найден на сервере'; break; // FileTransferError.FILE_NOT_FOUND_ERR
              case 2: textError = 'INVALID_URL_ERR'; break; // FileTransferError.INVALID_URL_ERR
              case 3: textError = 'Нет соединения, или недостаточно места'; break; // FileTransferError.CONNECTION_ERR // inet or space
              case 4: textError = 'ABORT_ERR'; break; // FileTransferError.ABORT_ERR
              case 5: textError = 'NOT_MODIFIED_ERR'; break;  // FileTransferError.NOT_MODIFIED_ERR
            }
            this.downloadFileError(`Мы не можем скачать файл: <b>${currentDownloaded.title}</b> <br> Причина: <b>${textError}</b>`);
          })
          .finally(() => this.loading.dismiss())
      }
    }

    await downloadPlayLsit()
      .finally(() => this.updateFileList());
  }

  async clear() {
    console.log('clear')
    this.loading = await this.loadingCtrl.create({
      message: 'Пожалуйста подождите...'
    });
    await this.loading.present();
    this.file.removeRecursively(this.file.dataDirectory, this.fileService.getAudioFolder).then(
      async (entry) => {
        console.log("Successful cleared...");
        this.updateFileList()
        await this.loading.dismiss();

      },
      async (error) => {
        if (error.message === 'NOT_FOUND_ERR') {
          alert('Already removed');
        }
        console.log(error);
        this.updateFileList()
        await this.loading.dismiss();
      }).catch(c => console.log(c));
  }



  private async downloadFileError(message: string) {
    const alert = await this.alertController.create({
      header: 'Ошибка!',
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
