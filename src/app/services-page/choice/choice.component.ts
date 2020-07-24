import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { NextModel, NameIdModel, PlayListModel, ServicePlayListModel, ServiceModel, ServicePlayListModelObject } from 'src/app/backend/interfaces';
import { SettingsService } from 'src/app/services/settings.service';
import { BaseComponent } from 'src/app/services/base-component';
import { distinctUntilChanged } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

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
  subscription: any;
  profileSubscription: any;
  stradasteya = new FormControl('');
  radasteya = new FormControl('');
  zituord = new FormControl('');
  buttonText = '';

  selectInterfaceOptions: any = {
    cssClass: 'ion-select-pupup-class'
  };

  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private settingsService: SettingsService) { super(); console.log('Choice: ctor'); }

  choice(item: NameIdModel, next: NextModel) {
    this.params.push(item.id);
    if (next) {
      this.router.navigate([`/tabs/services/${this.serviceId}/${(this.params.join('/'))}`]);
    }
    else {
      if (this.service.type === 'audio') {
        this.router.navigate([`/tabs/player/${this.serviceId}/${(this.params.join('/'))}`]);
      }
      if (this.service.type === 'video' || this.service.type === 'live') {
        this.router.navigate([`/tabs/home/${this.serviceId}/${(this.params.join('/'))}`]);
      }
    }
  }

  get isCalendar() {
    return this.serviceId === 1;
  }

  mainCoord() {
    this.router.navigate([`/tabs/player/${this.serviceId}/${this.stradasteya.value.id}/${this.radasteya.value.id}/${this.zituord.value.id}`]);
  }

  ngOnInit() {
    console.log('Choice: Init');
    this.activatedRoute.url.safeSubscribe(this, (segments: UrlSegment[]) => {

      this.serviceId = Number(segments[0].path);
      this.params = segments.filter((f, i) => i > 0).map((x) => Number(x.path));
      this.settingsService.getServicePlayListFromStorage(this.serviceId);
      this.settingsService.getServicePlayList(this.serviceId);
      let temp = this.dataService.getItems(this.serviceId, this.params);
      this.service = temp.service;
      this.model = temp.current;
      const serviceName = this.dataService.getSubServiceName(this.serviceId, this.params);
      if (this.service.id === 2) {
        this.subSectionName = this.params.length === 0 ? `Черпачок` : `Черпачок ${serviceName}`;
      } else {
        this.subSectionName = serviceName;
      }
    });
  }

  ionViewDidEnter() {
    this.subscription = this.settingsService.getServicePlayListAsync(this.serviceId)
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .safeSubscribe(this, (servicePlayList: ServicePlayListModelObject) => {
        console.log('getServicePlayListAsync, serviceId ', this.serviceId);
        this.playlistToDownload = [];
        if (servicePlayList) {
          this.playlistToDownload = this.dataService.getFilesToDownloads(this.service, servicePlayList);
        }
      });
  }

  ionViewWillLeave() {
    console.log('Choice: desroy');
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      console.log('unsubscribe');
    }

    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    console.log('Choice: ng desroy')
  }
}
