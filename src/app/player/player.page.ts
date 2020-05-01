import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService, PlayListModel } from '../services/data.service';
import { FormControl } from '@angular/forms';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileReader, FileError, FileEntry } from '@ionic-native/file/ngx';
import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {
  playlist: PlayListModel[] = [];
  needToDownloadFiles: PlayListModel[] = [];
  private loading: any;
  typeId = 0;
  segments: UrlSegment[];
  fileTransferCreate: FileTransferObject = this.fileTransfer.create();


  fileListInFolder = [];
  secretName = new FormControl('');
  secretNameWarning: string = '';
  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService,
    private fileTransfer: FileTransfer,
    private platform: Platform,
    private alertController: AlertController,
    private file: File, private loadingCtrl: LoadingController) {
    this.platform.ready().then(() => {
      if (this.platform.is("android") || this.platform.is("ios")) {
        this.getFileList();
      }
    });
  }

  private getFileList() {
    this.file.listDir(this.file.dataDirectory, this.audioFolder).then((files) => {
      this.fileListInFolder = files;
      console.log(files.length);
      if (files.length > 0) {

        // files.forEach(file => { //rewrite check by id
        //   console.log(file)
        // });
      }
    }, (error) => {
      console.log('Directory does not exist');
      this.fileListInFolder = [];
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
    }
  }

  play() {

  }
  private audioFolder = 'audio';
  private getPath(fileName: string) {
    return this.file.dataDirectory + `${this.audioFolder}/` + fileName;
  }

  async download(playList = null) {
    //debugger;
    this.needToDownloadFiles = playList ? playList : [...this.playlist]
    const download_retry = async (model, url: string, filePath: string, n) => {

      for (let i = 0; i < n; i++) {
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
          const isLastAttempt = i + 1 === n;
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
        const filePath = this.getPath(fileName.pop());

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
      .finally(() => this.getFileList());  }


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

  async clear() {
    console.log('clear')
    this.loading = await this.loadingCtrl.create({
      message: 'Пожалуйста подождите...'
    });
    await this.loading.present();
    this.file.removeRecursively(this.file.dataDirectory, this.audioFolder).then(
      async (entry) => {
        console.log("Successful cleared...");
        this.getFileList();
        await this.loading.dismiss();

      },
      async (error) => {
        if (error.message === 'NOT_FOUND_ERR') {
          alert('Already removed');
        }
        console.log(error);
        this.getFileList();
        await this.loading.dismiss();
      }).catch(c => console.log(c));
  }


  ngOnInit() {
    this.activatedRoute.url.subscribe((segments: UrlSegment[]) => {
      this.segments = segments;
      this.getPlayList();
    });
  }
}
