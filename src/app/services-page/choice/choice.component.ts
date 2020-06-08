import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { NextModel, NameIdModel, PlayListModel, ServicePlayListModel, ServiceModel } from 'src/app/backend/interfaces';
import { SettingsService } from 'src/app/services/settings.service';
import { BaseComponent } from 'src/app/services/base-component';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent extends BaseComponent implements OnInit, OnDestroy {
  model: NextModel = { items: [], next: null };
  serviceId: number;
  service: ServiceModel;
  playlistToDownload: PlayListModel[] = [];
  params?: Array<number> = [];
  subSectionName: string;
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private settingsService: SettingsService) { super(); console.log('Choice: ctor'); }

  choice(item: NameIdModel, next: NextModel) {
    this.params.push(item.id);
    if (next) {
      this.router.navigate([`/services/${this.serviceId}/${(this.params.join('/'))}`]);
    }
    else {
      this.router.navigate([`/player/${this.serviceId}/${(this.params.join('/'))}`]);
    }
  }

  get isCalendar() {
    return this.serviceId === 1;
  }

  get isNextCalendarStep() {
    return this.serviceId === 1 && this.params.length === 1;
  }
  subscription: any;
  ngOnInit() {
    console.log('Choice: Init');
    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {

      this.serviceId = Number(segments[0].path);
      this.params = segments.filter((f, i) => i > 0).map((x) => Number(x.path));
      let temp = this.dataService.getItems(this.serviceId, this.params);
      this.service = temp.service;
      this.model = temp.current;   
      this.subSectionName = this.dataService.getSubServiceName(this.serviceId, this.params);     
    });
  }

  ionViewDidEnter() {
    if (this.service.loadAll) {
      this.settingsService.getServicePlayListFromStorage(this.service, this.params);
      this.settingsService.getServicePlayList(this.service, this.params);
      this.subscription = this.settingsService.getServicePlayListAsync(this.serviceId)
        .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
        .safeSubscribe(this, (servicePlayList: ServicePlayListModel) => {
          console.log('getServicePlayListAsync');
          console.log(servicePlayList);
          this.playlistToDownload = [];
          if (servicePlayList) {
            this.playlistToDownload = this.dataService.getFilesToDownloads(this.service, servicePlayList);
          }
        });
    }
  }

  ionViewWillLeave() {
    console.log('Choice: desroy');
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      console.log('unsubscribe');
    }
  }

  ngOnDestroy() {
    console.log('Choice: ng desroy')
  }
}
