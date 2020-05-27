import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

const modules = [
  MatSliderModule,
  MatProgressBarModule
]


@NgModule({
  declarations: [],
  imports: [
    modules
  ],
  exports: [modules]
})
export class MaterialModule { } 
