import { Component, OnInit, Input } from '@angular/core';
import { Profile } from '../backend/interfaces';
import { BaseComponent } from '../services/base-component';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'profile-header',
  templateUrl: './profile-header.component.html',
  styleUrls: ['./profile-header.component.scss'],
})
export class ProfileHeaderComponent extends BaseComponent implements OnInit {
  public profile: Profile;
  constructor( private settingsService: SettingsService) { super(); }

  ngOnInit() {
    this.settingsService.getProfileDataAsync.safeSubscribe(this, (response: any) => {     
      this.profile = response;
    });
  }

}
