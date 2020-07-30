import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../services/base-component';
import { SettingsService } from '../services/settings.service';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { AudioObject } from '../backend/interfaces';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.page.html',
  styleUrls: ['./audio.page.scss'],
})
export class AudioPage extends BaseComponent implements OnInit {
  audioServices = [];
  constructor(private settingsService: SettingsService, private dataService: DataService) { super(); }

  ngOnInit() {
    this.settingsService.getAudioDataAsync
      .pipe(distinctUntilChanged((prev, curr) => Object.values(prev).map((t: AudioObject) => t.type).join('-') ===
        Object.values(curr).map((t: AudioObject) => t.type).join('-')))
      .safeSubscribe(this, (data => {
        // var data  = JSON.parse(JSON.stringify(d))
        console.log('get audio data structure async !!!!!!!!!!!!!!!!!!!!!!!');
        this.audioServices = Object.values(data)
          .map((m: any) => m.type)
          .filter((el: any, index, array) => array.indexOf(el) === index);
      }));
  }

  getAlbumDescription(type) {
    return this.dataService.getAlbumDescription(type);
  }

  ionViewWillEnter() {
    this.settingsService.getAudioStructure();
  }

  doRefresh(event) {
    this.settingsService.getAudioStructure();
    this.settingsService.completeAudioRequest$
      .pipe(take(1))
      .safeSubscribe(this, () => {
        console.log('complete refresh');
        event.target.complete();
      });
  }

}
