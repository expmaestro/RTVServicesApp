import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../services/base-component';
import { SettingsService } from '../services/settings.service';
import { distinctUntilChanged, take, filter } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { AudioObject, ServicePlayListModelObject, PlayListModel } from '../backend/interfaces';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-audio',
  templateUrl: './audio.page.html',
  styleUrls: ['./audio.page.scss'],
})
export class AudioPage extends BaseComponent implements OnInit {
  audioServices = [];
  searchValue = new FormControl('');
  fullAudioStructure: { [key: number]: AudioObject };
  constructor(private settingsService: SettingsService, private dataService: DataService) { super(); }

  ngOnInit() {
    this.settingsService.getAudioStructureAsync
      .pipe(filter(f => !!f))
      .pipe(distinctUntilChanged((prev, curr) => Object.values(prev).map((t: AudioObject) => t.type).join('-') ===
        Object.values(curr).map((t: AudioObject) => t.type).join('-')))
      .safeSubscribe(this, (data => {
        console.log('Get Audio Structure');
        this.fullAudioStructure = data;
        this.audioServices = Object.values(data)
          .map((m: any) => m.type)
          .filter((el: any, index, array) => array.indexOf(el) === index);

        //cache all paths for search
        const servicesIds = Object.keys(data).map(Number);
        this.settingsService.getAudioPlayList(servicesIds);
      }));

  }

  getAlbumDescription(type) {
    return this.dataService.getAlbumDescription(type);
  }

  ionViewWillEnter() {
    this.settingsService.getAudioStructure(); // move onInit ?
  }

  doRefresh(event) {
    this.settingsService.getAudioStructure();
    this.settingsService.completeAudioRequest$
      .pipe(take(1))
      .safeSubscribe(this, () => {
        console.log('complete refresh');
        if (event !== null) {
          event.target.complete();
        }
      });
  }

  update() {
    this.doRefresh(null);
  }
}
