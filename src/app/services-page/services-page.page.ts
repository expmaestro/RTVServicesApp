import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ServiceModel, DataService } from '../services/data.service';

@Component({
  selector: 'app-services-page',
  templateUrl: './services-page.page.html',
  styleUrls: ['./services-page.page.scss'],
})
export class ServicesPagePage implements OnInit {
  current = {};
  services: Array<ServiceModel>;
  constructor(private nav: NavController, private router: Router, private dataService: DataService) { }

  ngOnInit() {
    console.log('Component Init')
    this.services = this.dataService.getServices;
    
  }

  next(service: ServiceModel) {
    if (service.Next) {
      this.router.navigate([`/services/${service.Id}`]);
    } else {
      this.router.navigate([`/player/${service.Id}`]);
    }
  }
}