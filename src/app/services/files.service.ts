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

  getFullFilePath(fileName: string) {
    return this.file.dataDirectory + `${this.audioFolder}/` + fileName;
  }

  getFileNameFromSrc(src): string {
    if (!src) return '';
    const fileName = src.split('/');
    return fileName.pop();
  }

  public updateFiles() {
    this.getFileListFromFolder().then((r) => {
      this.files$.next(r);
    });
  }


  public getFileList(): Observable<any> {
    return this.files$.asObservable();
  }

  private getFileListFromFolder() { //observable
    //debugger;
    return this.file.listDir(this.file.dataDirectory, this.audioFolder)
      .then((files) => {
        console.log(files.length);
        if (files.length > 0) {

          // files.forEach(file => { //rewrite check by id
          //   console.log(file)
          // });
        }

        return files;
      }, (error) => {
        console.log('Directory does not exist');
        return [];
      });
  }

  fileExist(fileName: string): Promise<boolean> {
    return this.file.checkFile(this.file.dataDirectory + `${this.audioFolder}/`, fileName).then(() => {
      console.log('File exists');
      return true;

    }, (error: FileError) => {
      //console.log('File does not exist');
      return false;
    });
  }
}
