import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ServiceModel, DataService } from '../services/data.service';
import { SettingsService } from '../services/settings.service';
import { BaseComponent } from '../services/base-component';
import { Profile } from '../backend/interfaces';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-services-page',
  templateUrl: './services-page.page.html',
  styleUrls: ['./services-page.page.scss'],
})
export class ServicesPagePage extends BaseComponent implements OnInit {
  services: Array<ServiceModel> = [];
  public profile: Profile;
  public servicesRequest: any;
  apiUrl: any;

  constructor(private nav: NavController, private router: Router, private dataService: DataService, private settingsService: SettingsService) {
    super();
    this.settingsService.getUserData();
    this.settingsService.getServices();
  }

  ngOnInit() {
    this.apiUrl = environment.apiUrl
    this.settingsService.getProfileDataAsync.safeSubscribe(this, (r: any) => {
      this.profile = r;
    });

    this.settingsService.getServicesDataAsync.safeSubscribe(this, servs => {
      console.log(servs);
      this.services = [];
      this.dataService.getAllServices.forEach(s => {
        let baseService = servs.find(x => Number(x.id) === s.Id);
        if (baseService) {
          s.Name = baseService.name;
          s.position = Number(baseService.position);
          s.paid = baseService.paid;
          this.services.push(s);
        }
      });
      this.servicesRequest = servs;
    });
  }

  next(service: ServiceModel) {
    if (!service.paid) return;
    if (service.Next) {
      this.router.navigate([`/services/${service.Id}`]);
    } else {
      this.router.navigate([`/player/${service.Id}`]);
    }
  }
}