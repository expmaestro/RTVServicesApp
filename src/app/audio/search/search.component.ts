import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { PlayListModel, AudioObject, ServiceEnum, ServicePlayListModelObject } from 'src/app/backend/interfaces';
import { DataService } from 'src/app/services/data.service';
import { FormControl } from '@angular/forms';
import { BaseComponent } from 'src/app/services/base-component';
import { environment } from 'src/environments/environment';
import { MusicControlService } from 'src/app/services/music-control.service';
import { Subscription } from 'rxjs';
import { FilesService } from 'src/app/services/files.service';
import { SettingsService } from 'src/app/services/settings.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent extends BaseComponent implements OnInit, OnDestroy {
  catalog: PlayListModel[] = [];
  @Input()
  playlist: PlayListModel[] = [];
  @Input() searchValue: FormControl;
  @Output() initializate = new EventEmitter();
  @Input()
  set fullAudioStructure(data: { [key: number]: AudioObject }) {
    console.log(data);
    if (data) {
      this.fullCollections = this.getCollectionList(data);
      console.log('~~~~~~~~~~~~~~~~~~~~~set full structure``````````````');
      if (this.searchValue?.value) {
        this.updateSearch();
      }
    }
  };

  fullCollections = [];
  currentIndex = -1;

  playlistAreSame: boolean = undefined;
  apiUrl = environment.apiUrl;
  private subscriptions: Subscription[] = [];
  constructor(private dataService: DataService, private musicControlService: MusicControlService,
    private filesService: FilesService, private settingsService: SettingsService,) { super() }

  updateSearch() {
    console.log('update search');
    this.searchValue.setValue(this.searchValue.value);
  }

  private searchLogic(value: any) {
    if (value) {
      console.log(`Searching: ` + value);
      this.searchProcess(value);
      //  this.musicControlService.setPlaylistAreSame(true);
    }
    else {
      console.log(`Searching: init base`);
      this.catalog = [];
      this.playlist = [];
      this.initializate.emit();
    }
  }

  ngOnInit() {
    //console.log(this.playlist);
    // 
    const searchSubscription = this.searchValue.valueChanges
      .safeSubscribe(this, (value) => {
        console.log(value)
        this.searchLogic(value);
      });

    this.subscriptions.push(searchSubscription);

    const currentIndexSubscr = this.musicControlService.getCurrentIndex()
      .safeSubscribe(this, (index) => {
        this.currentIndex = index;
      });

    const subscrSamePlaylist = this.musicControlService.checkPlaylistAreSameAsync.safeSubscribe(this, (same) => {
      this.playlistAreSame = same;
      console.log(`same ${same}`)
    });
    this.subscriptions.push(currentIndexSubscr);
    this.subscriptions.push(subscrSamePlaylist);
  }

  errorHandler(event, service) {
    if (!event.target.noErrorMore) {
      event.target.src = service.cover;
      event.target.noErrorMore = true;
    }
  }

  getCollectionList(data: { [key: number]: AudioObject }) {
    const albums: PlayListModel[] = [];
    const musicArray: PlayListModel[] = [];
    const audioObjAlbums = Object.values(data)
      .filter((m: AudioObject) => m.active === '1');
    this.filesService.getImageLocalPath(null, audioObjAlbums);
    audioObjAlbums.forEach((albumObject: AudioObject) => {
      let album: PlayListModel = {
        id: albumObject.id,
        name: albumObject.name,
        path: albumObject.coverLocalPath,
        isDownload: false,
        condition: '',
        paid: albumObject.elements.every(e => e.user_access !== null),
        isCatalog: true,
        description: this.dataService.getSearchAlbumDescription(albumObject.type),
        serviceId: Number(albumObject.id),
        cover: albumObject.image,
        sectionName: albumObject.name,
        downloadAccess: false
      };

      albumObject.elements.forEach(a => {
        const userAccessNotNull = a.user_access !== null;
        const track: PlayListModel = {
          id: a.id,
          name: a.name,
          path: '',
          isDownload: false,
          condition: '',
          paid: userAccessNotNull,
          isCatalog: false,
          description: `${this.dataService.getAlbumDescription(albumObject.type)} / ${albumObject.name}`,
          serviceId: Number(albumObject.id),
          cover: albumObject.image,
          sectionName: albumObject.name,
          downloadAccess: userAccessNotNull && a.user_access.download
        };
        musicArray.push(track);
      });

      albums.push(album);
    });

    return albums.concat(musicArray);
  }

  play(index, entity: PlayListModel) {
    if (!entity.downloadAccess && !entity.paid) {
      window.location.href = `${environment.apiUrl}#personal=audioteka&materialId=${entity.id}&isPayment=true`;
      return;
    }
    if (this.searchValue.value) {
      this.updatePaths();
      this.musicControlService.setPlayList(this.playlist, ServiceEnum.audio);
      this.musicControlService.runTrack$.next(index);
    }
    else {
      this.musicControlService.setPlayList(this.playlist, ServiceEnum.audio);
      this.musicControlService.runTrack$.next(index);
    }
  }


  private updatePaths() {
    const paths: ServicePlayListModelObject = this.settingsService.getAudioPlayListValue();
    console.log(this.playlist);
    this.playlist.forEach(p => {
      if (paths[p.id]) {
        const parsed = JSON.parse(paths[p.id].find(f => f.type === 'file').json_data);
        p.path = (parsed.cdn === 'ngenix' ? environment.cdn : '') + parsed.path;
      }
    });
  }


  private searchProcess(value: any) {
    // console.log(`Searching: ${value}`);
    var result: PlayListModel[] = [];
    result = this.fullCollections.filter(f => f.name.toLowerCase().replace(new RegExp("ё", "g"), "е")
      .indexOf(value.toLowerCase().replace(new RegExp("ё", "g"), "е")) != -1);
    this.playlist = result.filter(f => !f.isCatalog);
    this.catalog = result.filter(f => f.isCatalog);
    console.log(this.playlist);
  }

  ngOnDestroy() {
    console.log('search destroy');
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

}
