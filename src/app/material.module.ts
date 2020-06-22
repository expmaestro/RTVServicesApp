import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

const modules = [
  MatSliderModule,
  MatProgressBarModule,
  MatInputModule,
  MatButtonModule,
]


@NgModule({
  declarations: [],
  imports: [
    modules
  ],
  exports: [modules]
})
export class MaterialModule { } 
