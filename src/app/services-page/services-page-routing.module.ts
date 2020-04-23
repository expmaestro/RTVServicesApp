import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServicesPagePage } from './services-page.page';

const routes: Routes = [
  {
    path: '',
    component: ServicesPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServicesPagePageRoutingModule {}
