import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LayoutPagePageRoutingModule } from './layout-page-routing.module';
import { LayoutPagePage } from './layout-page.page';
import { PlayerComponent } from '../player/player.component';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LayoutPagePageRoutingModule,
    MatSliderModule
  ],
  declarations: [
    LayoutPagePage,
    PlayerComponent
  ]
})
export class LayoutPagePageModule { }
