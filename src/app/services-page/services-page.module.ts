import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ServicesPagePageRoutingModule } from './services-page-routing.module';

import { ServicesPagePage } from './services-page.page';
import { ChoiceComponent } from './choice/choice.component';
import { MaterialModule } from '../material.module';
import { SharedModule } from '../shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServicesPagePageRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [ServicesPagePage, ChoiceComponent]
})
export class ServicesPagePageModule {}
