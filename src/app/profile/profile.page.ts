import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  public data: any;
  constructor(private settingsService: SettingsService) { }

  logout = () => {
    console.log('logout');
    //this.settingsService.authToken = null;
    //this.settingsService.refreshToken = null;

    // console.log(window.localStorage.
  }

  getUserInfo() {
    this.settingsService.getUserInfo().subscribe((r: any) => this.data = r.data);
  }

  ngOnInit() {
    this.getUserInfo();
  }

}
