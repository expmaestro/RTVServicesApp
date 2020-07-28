import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download/download.component';
import { MaterialModule } from './material.module';
import { IonicModule } from '@ionic/angular';
import { ProfileHeaderComponent } from './profile-header/profile-header.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [DownloadComponent, ProfileHeaderComponent],
  imports: [
   CommonModule,
   IonicModule,
   MaterialModule
  ],
  exports: [DownloadComponent, CommonModule, IonicModule, ProfileHeaderComponent, RouterModule]
})
export class SharedModule { }
