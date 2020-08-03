import { Component, OnInit } from '@angular/core';
import { PlayListModel, AudioObject, AudioPlayListModel } from 'src/app/backend/interfaces';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { BaseComponent } from 'src/app/services/base-component';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage extends BaseComponent implements OnInit {
  title = '';
  id: number = 0;
  playlist: AudioPlayListModel[] = [];
  private data: AudioObject = null;
  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService, private settingsService: SettingsService,) {
    super();
  }

  ngOnInit() {
    this.id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    console.log(this.id);
  }


  ionViewWillEnter() {
    this.settingsService.getAudioDataAsync
      // .pipe(distinctUntilChanged((prev: any, curr: any) => {
      //   let filteredPrev = Object.values(prev).filter((m: AudioObject) => m.type === this.type);
      //   // Object.values(prev).map(t => t.type).join('-') === Object.values(curr).map(t => t.type).join('-')
      //   return true;
      // }))
      .safeSubscribe(this, ((data: { [key: number]: AudioObject }) => {
        // var data  = JSON.parse(JSON.stringify(d))
        // console.log('get album data structure async !!!!!!!!!!!!!!!!!!!!!!!');
        // this.albums = Object.values(data)
        //   .filter((m: AudioObject) => m.type === this.type);
        // console.log(this.albums)
        // this.filesService.getImageLocalPath(null, this.albums);
        this.data = data[this.id];
        this.title = this.data.name;
        console.log(this.data);

        data[this.id].elements.forEach(element => {
          this.playlist.push({
            id: element.id,
            name: element.name,
            path: '1',
            isDownload: false
          });
        });

      }));
  }

  play(index) {
    
  }

}
