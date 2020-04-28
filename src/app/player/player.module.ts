import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PlayerPageRoutingModule } from './player-routing.module';
import { PlayerPage } from './player.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlayerPageRoutingModule,
  ],
  declarations: [PlayerPage],
  providers: []
})
export class PlayerPageModule {}
