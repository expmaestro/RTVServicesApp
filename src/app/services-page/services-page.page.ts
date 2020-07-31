import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { BaseComponent } from '../services/base-component';
import { Profile, ServiceModel } from '../backend/interfaces';
import { environment } from 'src/environments/environment';
import { FilesService } from '../services/files.service';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { ElementSchemaRegistry } from '@angular/compiler';

@Component({
  selector: 'app-services-page',
  templateUrl: './services-page.page.html',
  styleUrls: ['./services-page.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ServicesPagePage extends BaseComponent implements OnInit {
  services: Array<ServiceModel> = [];
  public profile: Profile;

  constructor(private router: Router, private settingsService: SettingsService, private filesService: FilesService,
    private platform: Platform) {
    super();
    this.settingsService.getUserProfileData();
    // this.settingsService.getServices();
  }

  ngOnInit() {
    this.settingsService.getProfileDataAsync.safeSubscribe(this, (response: any) => {
      this.profile = response;
    });
    this.settingsService.getServicesDataAsync
      .pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .safeSubscribe(this, serv => {
        const services = JSON.parse(JSON.stringify(serv));
        console.log('get services');
        this.services = services;
        this.platform.ready().then(() => {
          this.filesService.getImageLocalPath(this.services, null);
        });
      });
  }



  errorHandler(event, service) {
    if (!event.target.noErrorMore) {
      event.target.src = service.cover;
      event.target.noErrorMore = true;
    }
  }

  ionViewWillEnter() {
    this.settingsService.getServices();
  }

  next(service: ServiceModel) {
    if (!service.paid) {
      window.location.href = `${environment.apiUrl}#personal=services&service=${service.id}&`;
      return;
    }
    if (service.next) {
      this.router.navigate([`/tabs/services/${service.id}`]);
    } else {
      this.router.navigate([`/tabs/services/player/${service.id}`]);
    }
  }

  doRefresh(event) {
    this.settingsService.getServices();
    this.settingsService.completeServiceRequest$
      .pipe(take(1))
      .safeSubscribe(this, () => {
        console.log('complete refresh');
        event.target.complete();
      });
  }
}