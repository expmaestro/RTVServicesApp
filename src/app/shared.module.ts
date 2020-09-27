import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download/download.component';
import { MaterialModule } from './material.module';
import { IonicModule } from '@ionic/angular';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { RouterModule } from '@angular/router';
import { SearchComponent } from './audio/search/search.component';



@NgModule({
  declarations: [DownloadComponent, SearchComponent, ProfileHeaderComponent],
  imports: [
   CommonModule,
   IonicModule,
   MaterialModule,
   RouterModule,
  ],
  exports: [DownloadComponent, CommonModule, SearchComponent, IonicModule, ProfileHeaderComponent, RouterModule]
})
export class SharedModule { }
