import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { SettingsService } from '../services/settings.service';
import { BaseComponent } from '../services/base-component';
import { Profile, ServiceModel } from '../backend/interfaces';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-services-page',
  templateUrl: './services-page.page.html',
  styleUrls: ['./services-page.page.scss'],
})
export class ServicesPagePage extends BaseComponent implements OnInit {
  services: Array<ServiceModel> = [];
  public profile: Profile;
  apiUrl: any;

  constructor(private nav: NavController, private router: Router, private settingsService: SettingsService) {
    super();
    this.settingsService.getUserData();
    // this.settingsService.getServices();
  }

  ngOnInit() {
    this.apiUrl = environment.apiUrl
    this.settingsService.getProfileDataAsync.safeSubscribe(this, (response: any) => {
      this.profile = response;
    });
    this.settingsService.getServicesDataAsync.safeSubscribe(this, services => {
      this.services = services;
    });
  }

  ionViewWillEnter () {
    this.settingsService.getServices();
  }  

  next(service: ServiceModel) {
    if (!service.paid) return;
    if (service.next) {
      this.router.navigate([`/services/${service.id}`]);
    } else {
      this.router.navigate([`/player/${service.id}`]);
    }
  }
}