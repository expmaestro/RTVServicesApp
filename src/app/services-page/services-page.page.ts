import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { BaseComponent } from '../services/base-component';
import { Profile, ServiceModel } from '../backend/interfaces';
import { environment } from 'src/environments/environment';
import { FilesService } from '../services/files.service';
//import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-services-page',
  templateUrl: './services-page.page.html',
  styleUrls: ['./services-page.page.scss'],
})
export class ServicesPagePage extends BaseComponent implements OnInit {
  services: Array<ServiceModel> = [];
  public profile: Profile;

  constructor(private nav: NavController, private router: Router, private settingsService: SettingsService, private filesService: FilesService,
    private platform: Platform,) {
    super();
    this.settingsService.getUserData();
    // this.settingsService.getServices();
  }

  ngOnInit() {
    this.settingsService.getProfileDataAsync.safeSubscribe(this, (response: any) => {
      this.profile = response;
    });
    this.settingsService.getServicesDataAsync
      //.pipe(distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)))
      .safeSubscribe(this, services => {
        this.services = services;
        this.platform.ready().then(() => {
          let win: any = window;
          if (this.platform.is("android") || this.platform.is("ios")) {
            this.services.forEach(service => {
              let temp = this.filesService.getCoverFullPath(this.filesService.getCoverImageName(service.cover));
              let path = win.Ionic.WebView.convertFileSrc(temp);
              path = path.replace('undefined', "http://localhost"); // solution for live reload mode
              service.coverLocalPath = path;
            });
          }
        });
      });
  }

  errorHandler(event, service) {
   // console.log('error: ' + event.target.src)
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
      this.router.navigate([`/services/${service.id}`]);
    } else {
      this.router.navigate([`/player/${service.id}`]);
    }
  }
}