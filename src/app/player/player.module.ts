import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlayerPageRoutingModule } from './player-routing.module';
import { PlayerPage } from './player.page';
import { DownloadComponent } from '../download/download.component';
import { MatSliderModule } from '@angular/material/slider';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlayerPageRoutingModule,
    MatSliderModule
  ],
  declarations: [PlayerPage, DownloadComponent],
  providers: []
})
export class PlayerPageModule {}
