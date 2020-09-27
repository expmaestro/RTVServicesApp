import { Injectable } from '@angular/core';
import { File, FileReader, FileError, Entry, DirectoryEntry } from '@ionic-native/file/ngx';
import { Observable, BehaviorSubject } from 'rxjs';
import { LoadingController, ToastController, Platform } from '@ionic/angular';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer/ngx';
import { AudioObject, ServiceModel, ServiceEnum } from '../backend/interfaces';


@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private file: File, private loadingCtrl: LoadingController, private toastController: ToastController, private platform: Platform, private fileTransfer: FileTransfer) { }
  private loading: any;
  private audioFolder = 'audio';
  private imageFolder = 'images';

  serviceImageSubFolder = '_service'; // images/_service
  audioImageSubFolder = '_audio'; //images/_audio

  public files$ = new BehaviorSubject<any>(null);
  fileTransferCreate: FileTransferObject;

  get getAudioFolder(): string {
    return this.audioFolder;
  }

  getImageFolder(type: string): string {
    return `${this.imageFolder}/${type}`;
  }

  getFullFolderPath(serviceId: number) {
    return this.file.dataDirectory + `${this.getAudioFolder}/${serviceId}/`;
  }

  getFullFilePath(serviceId: number, fileName: string) {
    return this.file.dataDirectory + `${this.getAudioFolder}/${serviceId}/` + fileName;
  }

  getCoverFullPath(fileName: string, type: ServiceEnum) {
    if (type === ServiceEnum.audio && !fileName) {
      return 'assets/img/logo-512.png';
    }
    const subFolder = type === ServiceEnum.service ? this.serviceImageSubFolder : this.audioImageSubFolder;
    return this.file.dataDirectory + `${this.getImageFolder(subFolder)}/` + fileName;
  }

  getFileNameFromSrc(src: string): string {
    if (!src) return '';
    let type = src.split('.');
    let hashFileName = this.generateHash(src) + '.' + type[type.length - 1];

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
        console.log(`Files in phone (current service folder: ${folder}): ${files.length}`);
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

  async clear(serviceId = null, showLoader = true): Promise<void> {
    console.log('clear')
    if (showLoader) {
      this.loading = await this.loadingCtrl.create({
        message: 'Пожалуйста подождите...'
      });
      await this.loading.present();
    }

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
        if (showLoader) {
          await this.loading.dismiss();
        }
      });
  }

  private async presentToast(message: string) { //TODO: maybe toastr service, because duplicate
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: 'secondary'
    });
    toast.present();
  }

  cacheImages(covers: string[], type: ServiceEnum) {
    covers = covers.filter(f => f.length > 0);
    const imageSubFolder = type === ServiceEnum.service ? this.serviceImageSubFolder : this.audioImageSubFolder;
    this.fileTransferCreate = this.fileTransfer.create();
    this.getFileListFromFolder(this.getImageFolder(imageSubFolder)).then((files) => {
      let allFilesInFolder = covers.every(cover => {
        let temp = cover.split('/');
        let name = temp.pop();
        return files.some((fileInFolder) => fileInFolder.name === name);
      });
      console.log('allFilesInFolder ' + allFilesInFolder);
      if (!allFilesInFolder) {
        return this.file.removeRecursively(this.file.dataDirectory, this.getImageFolder(imageSubFolder)).then(
          async (entry) => {
            console.log('Images sucessfully removed');
          },
          async (error) => {
            console.log('Nothing to remove');
          }).finally(() => {
            console.log('We need saved Images');
            covers.forEach(cover => {
              let name = this.getCoverImageName(cover);
              this.fileTransferCreate.download(cover, this.getCoverFullPath(name, type), false)
                .then((r) => console.log(r))
                .catch(c => console.log(c));
            });
          })
      }
    });
  }

  getCoverImageName(cover: string) {
    let temp = cover.split('/');
    return temp.pop();
  }

  directorySize(directory: DirectoryEntry): Promise<number> {
    return this.size(directory);
  }

  private size(entry: Entry) {
    if (entry.isFile) {
      return new Promise<number>((resolve, reject) => {
        entry.getMetadata(f => resolve(f.size), error => reject(error))
      });
    }

    if (entry.isDirectory) {
      return new Promise<number>((resolve, reject) => {
        const directoryReader = (entry as DirectoryEntry).createReader();
        directoryReader.readEntries((entries: Entry[]) => {
          Promise.all(entries.map(e => this.size(e))).then((size: number[]) => {
            const dirSize = size.reduce((prev, current) => prev + current, 0);
            resolve(dirSize);
          }).catch(err => reject(err));
        },
          (error) => reject(error));
      })
    }
  }


  getImageLocalPath(services: ServiceModel[], albums: AudioObject[]) {
    let win: any = window;
    if (services !== null) {
      services.forEach(service => {
        if (service.cover) {
          let temp = this.getCoverFullPath(this.getCoverImageName(service.cover), ServiceEnum.service);
          let path = win.Ionic.WebView?.convertFileSrc(temp);
          path = path.replace('undefined', "http://localhost"); // solution for live reload mode
          service.coverLocalPath = path;
        }
      });
    } else if (albums !== null) {

      albums.forEach(album => {
        let temp = this.getCoverFullPath(this.getCoverImageName(album.image), ServiceEnum.audio);
        let path = win.Ionic.WebView?.convertFileSrc(temp);
        path = path.replace('undefined', "http://localhost"); // solution for live reload mode
        album.coverLocalPath = path;
      });
    }

  }
}
