import { Injectable } from '@angular/core';
import { File, FileReader, FileError, FileEntry } from '@ionic-native/file/ngx';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';


@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private file: File, private loadingCtrl: LoadingController, private toastController: ToastController, private platform: Platform, private fileTransfer: FileTransfer) { }
  private loading: any;
  private audioFolder = 'audio';
  private imageFolder = 'images';
  public files$ = new BehaviorSubject<any>(null);
  fileTransferCreate: FileTransferObject;

  get getAudioFolder(): string {
    return this.audioFolder;
  }

  get getImageFolder(): string {
    return this.imageFolder;
  }

  getFullFilePath(serviceId: number, fileName: string) {
    return this.file.dataDirectory + `${this.getAudioFolder}/${serviceId}/` + fileName;
  }

  getCoverFullPath(fileName: string) {
    return this.file.dataDirectory + `${this.getImageFolder}/` + fileName;
  }

  getFileNameFromSrc(src: string): string {
    if (!src) return '';
    let hashFileName = this.generateHash(src) + '.mp3';
    return hashFileName;
  }

  private generateHash(string) {
    var hash = 0;
    if (string.length == 0)
      return hash;
    for (let i = 0; i < string.length; i++) {
      var charCode = string.charCodeAt(i);
      hash = ((hash << 7) - hash) + charCode;
      hash = hash & hash;
    }
    return hash;
  }

  public updateFiles(serviceId) {
    this.getFileListFromFolder(this.getAudioFolder + `/${serviceId}`).then((r) => {
      this.files$.next(r);
    });
  }


  getFileList(serviceId: number): Observable<any> {
    console.log('!!!!!!!!!!Get FileList!!!!!!!!!!!!')
    return this.files$.asObservable();
  }

  getFileListFromFolder(folder: string) { //observable
    return this.file.listDir(this.file.dataDirectory, folder)
      .then((files) => {
        console.log(`Files in phone: ${files.length}`)
        if (files.length > 0) {

          // files.forEach(file => { //rewrite check by id
          //   console.log(file.fullPath)
          // });
        }

        return files;
      }, (error) => {
        console.log('Directory does not exist!');
        return [];
      });
  }

  fileExist(fileName: string, serviceId: number): Promise<boolean> {
    return this.file.checkFile(this.file.dataDirectory + `${this.getAudioFolder}/${serviceId}/`, fileName).then(() => {
      console.log('File exists');
      return true;

    }, (error: FileError) => {
      //console.log('File does not exist');
      return false;
    });
  }

  async clear(serviceId = null): Promise<void> {
    console.log('clear')
    this.loading = await this.loadingCtrl.create({
      message: 'Пожалуйста подождите...'
    });
    await this.loading.present();
    const folded = serviceId ? `${this.getAudioFolder}/${serviceId}/` : this.getAudioFolder;
    return this.file.removeRecursively(this.file.dataDirectory, folded).then(
      async (entry) => {
        if (!serviceId) this.presentToast('Медиа кэш очищен успешно.');
      },
      async (error) => {
        if (error.message === 'NOT_FOUND_ERR') {
          if (!serviceId) this.presentToast('Медиа кэш очищен успешно.');
        }
        console.log(error);

      }).finally(async () => {
        await this.loading.dismiss();
        if (serviceId) {

        }
      });
  }

  private async presentToast(message: string) { // maybe toastr service, because duplicate
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'secondary'
    });
    toast.present();
  }

  cacheImages(covers: string[]) {
    this.fileTransferCreate = this.fileTransfer.create();
    this.getFileListFromFolder(this.getImageFolder).then((files) => {
      let allFilesInFolder = covers.every(cover => {
        let temp = cover.split('/');
        let name = temp.pop();
        return files.some((fileInFolder) => fileInFolder.name === name);
      });
      console.log('allFilesInFolder ' + allFilesInFolder);
      if (!allFilesInFolder) {
        return this.file.removeRecursively(this.file.dataDirectory, this.getImageFolder).then(
          async (entry) => {
            console.log('Images sucessfully removed');
          },
          async (error) => {
            console.log('Nothing to remove');
          }).finally(() => {
            console.log('We need saved Images');
            covers.forEach(cover => {
              let name = this.getCoverImageName(cover);
              this.fileTransferCreate.download(cover, this.getCoverFullPath(name), false)
                .then((r) => console.log(r));
            });
          })
      }
    });
  }

  getCoverImageName(cover: string) {
    let temp = cover.split('/');
    return temp.pop();
  }

}
