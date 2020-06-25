import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlayerPageRoutingModule } from './player-routing.module';
import { PlayerPage } from './player.page';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlayerPageRoutingModule, 
    MaterialModule,
    SharedModule
  ],
  declarations: [PlayerPage],
  providers: []
})
export class PlayerPageModule { }
