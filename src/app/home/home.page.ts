import { Component } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { BaseComponent } from '../services/base-component';
import { DataService } from '../services/data.service';
import { SettingsService } from '../services/settings.service';
import { ServicePlayListModelObject, ServicePlayListModel, PlayListModel } from '../backend/interfaces';
import { distinctUntilChanged, filter, takeUntil, take } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { Platform } from '@ionic/angular';
import { FilesService } from '../services/files.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage extends BaseComponent {

  videoSrc = '';
  service: any;
  private win: any = window;
  private subscription: any;
  playlistToDownload$ = new BehaviorSubject<PlayListModel[]>([]);

  constructor(private activatedRoute: ActivatedRoute, private dataService: DataService, private settingsService: SettingsService,
    private platform: Platform, private fileService: FilesService) { super() }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {
        let params = segments.filter((param, index) => index > 0).map((x) => Number(x.path));
        if (segments.length > 0) {
          const serviceId = Number(segments[0].path);
          this.service = this.dataService.getService(serviceId);
          //  this.params = this.segments.filter((param, index) => index > 0).map((x) => Number(x.path));
          // this.title = this.dataService.getFullSectionName(this.service, this.params);

          this.settingsService.getServicePlayListFromStorage(this.service.id);
          this.settingsService.getServicePlayList(this.service.id);

          this.subscription = this.settingsService.getServicePlayListAsync(this.service.id)
            .pipe(distinctUntilChanged((prev, curr) => {
              return JSON.stringify(prev) === JSON.stringify(curr);
            }))
            .safeSubscribe(this, async (servicePlayList: ServicePlayListModelObject) => {
              let subServicePlayList: ServicePlayListModel = servicePlayList[`${this.service.id}.1-1`];
              let file = subServicePlayList.additional[subServicePlayList.main[0].id][params[0]][0] // this.dataService.buildComputedPlayList(subServicePlayList, params[0], null, null, []);
              if (file) {
                const filePath = file.path;
                
               
                const fileName = this.fileService.getFileNameFromSrc(filePath);
                console.log('Open video with name: ' + fileName);
                const fileExist = await this.fileService.fileExist(fileName, serviceId);
                const filePathOrUrl = fileExist
                  ? this.win.Ionic.WebView.convertFileSrc(this.fileService.getFullFilePath(serviceId, fileName))
                  : filePath;
                console.log(filePathOrUrl);
                this.videoSrc = filePathOrUrl;

                let playlistToDownload = {
                  name: file.name,
                  path: filePath,
                  condition: '',
                  id: '',
                  isDownload: false
                };//this.dataService.getFilesToDownloads(this.service, servicePlayList);
                this.playlistToDownload$.next([playlistToDownload]);
              }
            });
        }
      })
    })
  }
}
