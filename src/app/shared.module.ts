import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadComponent } from './download/download.component';
import { MaterialModule } from './material.module';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [DownloadComponent],
  imports: [
   CommonModule,
   IonicModule,
   MaterialModule
  ],
  exports: [DownloadComponent, CommonModule, IonicModule]
})
export class SharedModule { }
