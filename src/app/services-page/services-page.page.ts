import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ServiceModel, DataService } from '../services/data.service';
import { SettingsService, Profile } from '../services/settings.service';
import { BaseComponent } from '../services/base-component';

@Component({
  selector: 'app-services-page',
  templateUrl: './services-page.page.html',
  styleUrls: ['./services-page.page.scss'],
})
export class ServicesPagePage extends BaseComponent implements OnInit {
  current = {};
  services: Array<ServiceModel>;
  public data: Profile;

  constructor(private nav: NavController, private router: Router, private dataService: DataService, private settingsService: SettingsService) { 
    super();
     this.settingsService.getProfileDataWithRequest();
   }

  ngOnInit() {
    this.services = this.dataService.getServices;   
    this.settingsService.getProfileData.safeSubscribe(this, r => {
      this.data = r;
    });
  }

  next(service: ServiceModel) {
    if (service.Next) {
      this.router.navigate([`/services/${service.Id}`]);
    } else {
      this.router.navigate([`/player/${service.Id}`]);
    }
  }
}