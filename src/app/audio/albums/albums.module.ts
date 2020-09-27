import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AlbumsPageRoutingModule } from './albums-routing.module';

import { AlbumsPage } from './albums.page';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AlbumsPageRoutingModule,
    SharedModule
  ],
  declarations: [AlbumsPage]
})
export class AlbumsPageModule {}
