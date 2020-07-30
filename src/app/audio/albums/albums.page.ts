import { Component, OnInit } from '@angular/core';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/services/base-component';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { AudioObject } from 'src/app/backend/interfaces';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.page.html',
  styleUrls: ['./albums.page.scss'],
})
export class AlbumsPage extends BaseComponent implements OnInit {

  type = '';
  albums: Array<AudioObject> = [];
  constructor(private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private settingsService: SettingsService,
    private filesService: FilesService) {
    super();
  }

  getAlbumDescription(type) {
    return this.dataService.getAlbumDescription(type);
  }

  ngOnInit() {
    this.type = this.activatedRoute.snapshot.paramMap.get('type');
    // console.log(this.type);

    this.settingsService.getAudioDataAsync
      // .pipe(distinctUntilChanged((prev: any, curr: any) => {
      //   let filteredPrev = Object.values(prev).filter((m: AudioObject) => m.type === this.type);
      //   // Object.values(prev).map(t => t.type).join('-') === Object.values(curr).map(t => t.type).join('-')
      //   return true;
      // }))
      .safeSubscribe(this, ((data: { [key: number]: AudioObject }) => {
        // var data  = JSON.parse(JSON.stringify(d))
        console.log('get album data structure async !!!!!!!!!!!!!!!!!!!!!!!');
        this.albums = Object.values(data)
          .filter((m: AudioObject) => m.type === this.type);
        console.log(this.albums)

      }));

  }

  private transform(data) {
    let result = [];
    let elements = [];
    let user_count = 0;
    for (let i in data) {
      elements = [];
      user_count = 0;
      for (let j in data[i].elements) {
        elements.push(data[i].elements[j]);
        for (let g in data[i].elements[j].user_access) {
          if (data[i].elements[j].user_access[g]) {
            user_count++;
            break;
          };
        };
      };
      data[i].material_count = elements.length;
      data[i].material_user_count = user_count;
      if (data[i].active === "1") {
        result.push(data[i]);
      };
    };
    return result;
  };

}
