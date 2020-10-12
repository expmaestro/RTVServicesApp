import { Component, OnInit } from '@angular/core';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'src/app/services/base-component';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { distinctUntilChanged, take, filter } from 'rxjs/operators';
import { AudioObject } from 'src/app/backend/interfaces';
import { FilesService } from 'src/app/services/files.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-albums',
  templateUrl: './albums.page.html',
  styleUrls: ['./albums.page.scss'],
})
export class AlbumsPage extends BaseComponent implements OnInit {
  searchValue = new FormControl('');
  fullAudioStructure: { [key: number]: AudioObject };
  type = '';
  buttonText = '';
  subscriptions: Subscription[] = [];
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

  ionViewWillEnter() {

    const sub = this.settingsService.getAudioStructureAsync
      .pipe(filter(f => !!f))
      // .pipe(distinctUntilChanged((prev: any, curr: any) => {
      //   let filteredPrev = Object.values(prev).filter((m: AudioObject) => m.type === this.type);
      //   // Object.values(prev).map(t => t.type).join('-') === Object.values(curr).map(t => t.type).join('-')
      //   return true;
      // }))
      .safeSubscribe(this, ((data: { [key: number]: AudioObject }) => {
        console.log(data);
        // var data  = JSON.parse(JSON.stringify(d))
        console.log('get album data structure async !!!!!!!!!!!!!!!!!!!!!!!');
        this.fullAudioStructure = data;
        let array = Object.values(data)
          .filter((m: AudioObject) => m.type === this.type && m.active === '1');
        // console.log(this.albums)
        this.albums = [];
        array.forEach(album => {          
          this.albums.push({
            active: album.active,
            coverLocalPath: album.coverLocalPath,
            description: album.description,
            elements: album.elements,
            id: album.id,
            image: album.image,
            json_data: album.json_data,
            name: album.name,
            paid: album.elements.every(e => e.user_access !== null),
            tmp_rubric_id: album.tmp_rubric_id,
            type: album.type,
          });
        })
        this.filesService.getImageLocalPath(null, this.albums);
      }));
    this.subscriptions.push(sub);
  }

  errorHandler(event, album: AudioObject) {
    if (!event.target.noErrorMore) {
      event.target.src = environment.apiUrl + album.image;
      event.target.noErrorMore = true;
    }
  }

  parse(str: string) {
    return JSON.parse(str);
  }


  ngOnInit() {
    //this.settingsService.getAudioStructure();
    this.type = this.activatedRoute.snapshot.paramMap.get('type');
  }

  ionViewWillLeave() {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

  ngOnDestroy() {

  }

  buy(collectionId: number) {
    window.location.href = `${environment.apiUrl}#personal=audioteka&collectionId=${collectionId}&isPayment=true`;
    console.log('redirect')
  }

  getTime(service): string {
    const allDownloads = service.elements.every(f => f.user_access.download);
    if(allDownloads) {
      return 'Доступ до 31 декабря 2020';
    }

    const first = service.elements.find(f => !f.user_access.download);
    if (first) {
      //console.log(first)
      return 'Осталось ' + this.dataService.messageTimeByMinutes(first.user_access.time_to_end);
    }
    return '';
  }  

  update() {
    this.settingsService.getAudioStructure();
    this.settingsService.completeAudioRequest$
      .pipe(take(1))
      .safeSubscribe(this, () => {
        console.log('complete refresh');
      });
  }
}
