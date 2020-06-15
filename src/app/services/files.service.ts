import { Injectable } from '@angular/core';
import { File, FileReader, FileError, FileEntry } from '@ionic-native/file/ngx';
import { Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private file: File) { }

  private audioFolder = 'audio';
  public files$ = new BehaviorSubject<any>(null);

  get getAudioFolder(): string {
    return this.audioFolder;
  }

  getFullFilePath(serviceId: number, fileName: string) {
    return this.file.dataDirectory + `${this.audioFolder}/${serviceId}/` + fileName;
  }

  getFileNameFromSrc(src: string): string {
    if (!src) return '';
  //  src = src.replace(/\//g, '-');
   // console.log(src);
    let t=  this.generateHash(src) + '.mp3';
    console.log(t);
    return t;
    // const fileName = src.split('/');
    // return fileName.pop();
  }

  generateHash(string) {
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
    this.getFileListFromFolder(serviceId).then((r) => {
      this.files$.next(r);
    });
  }


  getFileList(serviceId: number): Observable<any> {
    return this.files$.asObservable();
  }

  private getFileListFromFolder(serviceId: number) { //observable
    return this.file.listDir(this.file.dataDirectory, this.audioFolder + `/${serviceId}`)
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
    return this.file.checkFile(this.file.dataDirectory + `${this.audioFolder}/${serviceId}/`, fileName).then(() => {
      console.log('File exists');
      return true;

    }, (error: FileError) => {
      //console.log('File does not exist');
      return false;
    });
  }
}
