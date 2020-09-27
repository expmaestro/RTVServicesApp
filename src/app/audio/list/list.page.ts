import { Component, OnInit, ViewChild } from '@angular/core';
import { PlayListModel, AudioObject, ServiceEnum, ServiceModel, ServicePlayListModelObject } from 'src/app/backend/interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SettingsService } from 'src/app/services/settings.service';
import { BaseComponent } from 'src/app/services/base-component';
import { environment } from 'src/environments/environment';
import { distinctUntilChanged, take, filter } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MusicControlService } from 'src/app/services/music-control.service';
import { FormControl } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { FilesService } from 'src/app/services/files.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage extends BaseComponent implements OnInit {
  playlistToDownload$ = new BehaviorSubject<PlayListModel[]>([]);
  title = '';
  buttonText = '';

  id: number = 0;
  fullAudioStructure: { [key: number]: AudioObject };
  playlist: PlayListModel[] = [];
  searchValue = new FormControl('');
  private subscriptions: Subscription[] = [];
  private fullPaths: ServicePlayListModelObject;

  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService,
    private settingsService: SettingsService, private musicControlService: MusicControlService,
    private platform: Platform, private fileService: FilesService,
  ) {
    super();
  }

  ngOnInit() {
    this.id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.settingsService.getAudioStructure();
  }

  ionViewWillEnter() {
    this.settingsService.getAudioPlayList([this.id]);

    const audioStructureSubscr = this.settingsService.getAudioStructureAsync
      .pipe(filter(d => !!d)) // filtered if null
      .pipe(distinctUntilChanged((prev: any, curr: any) => {
        //  let a1 = this.dataService.compareAuidoObject(prev, this.id);
        //  let a2 = this.dataService.compareAuidoObject(curr, this.id);
        // console.log(JSON.stringify(a1));
        //  console.log(JSON.stringify(a2));


        let result = JSON.stringify(this.dataService.compareAuidoObject(prev, this.id)) === JSON.stringify(this.dataService.compareAuidoObject(curr, this.id));
        //console.log(result)
        return result;
      }))
      .safeSubscribe(this, ((data: { [key: number]: AudioObject }) => {
        console.log('Get Audio Structure');
        // console.log(data);
        this.fullAudioStructure = data;
      }));

    const audioPlaySubscription = this.settingsService.getAudioPlayListAsync()
      .pipe(filter(f => !!f))
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .safeSubscribe(this, (paths) => {
        console.log('Get Track paths');
        this.fullPaths = paths;
        this.buildPlayList();       
        this.musicControlService.setPlayList(this.playlist, ServiceEnum.audio);
        console.log(this.playlist)
        this.playlistToDownload$.next(this.playlist);
      });

    this.subscriptions.push(audioStructureSubscr);
    this.subscriptions.push(audioPlaySubscription);
  }

  buildPlayList() {
    this.playlist = [];
    const album = this.fullAudioStructure[this.id];
    this.title = album.name;

    this.playlist = this.fullAudioStructure[this.id].elements.map(element => {
      return {
        id: element.id,
        name: element.name,
        path: '',
        isDownload: undefined,
        condition: '',
        paid: element.user_access !== null,
        serviceId: this.id,
        cover: album.image,
        sectionName: this.title,
        description: '',
        isCatalog: false,
        downloadAccess: false,
      };
    });
    this.updatePaths(this.fullPaths);
  }

  

  private updatePaths(paths: ServicePlayListModelObject) {

    this.platform.ready().then(() => {
      this.fileService.updateFiles(this.id);
      this.fileService.getFileList(this.id).safeSubscribe(this, files => {
        if (!files) return;
        this.playlist.forEach(p => {
          const parsed = JSON.parse(paths[p.id].find(f => f.type === 'file').json_data);
          p.path = (parsed.cdn === 'ngenix' ? environment.cdn : '') + parsed.path;
          p.isDownload = files.some((fileInFolder) => fileInFolder.name === this.fileService.getFileNameFromSrc(p.path));
        });
      });
    });   
  }

  ionViewWillLeave() {
    this.subscriptions.forEach(
      (subscription) => subscription.unsubscribe());
    this.subscriptions = [];
  }

}
