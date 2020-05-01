import { Injectable } from '@angular/core';
import { File, FileReader, FileError, FileEntry } from '@ionic-native/file/ngx';


@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private file: File) { }

  private audioFolder = 'audio';

  get getAudioFolder(): string {
    return this.audioFolder;
  }

  getPath(fileName: string) {
    return this.file.dataDirectory + `${this.audioFolder}/` + fileName;
  }

  getFileList() { //observable
    return this.file.listDir(this.file.dataDirectory, this.audioFolder)
      .then((files) => {
        //this.fileListInFolder = files;
        console.log(files.length);
        if (files.length > 0) {

          // files.forEach(file => { //rewrite check by id
          //   console.log(file)
          // });
        }

        return files;
      }, (error) => {
        console.log('Directory does not exist');
        // this.fileListInFolder = [];
        return [];
      });
  }

  needDonwload() {
    return true;
  }
}
