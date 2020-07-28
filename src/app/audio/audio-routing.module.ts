import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AudioPage } from './audio.page';

const routes: Routes = [
  {
    path: '',
    component: AudioPage
  },
  // {
  //   path: 'albums',
  //   loadChildren: () => import('./albums/albums.module').then( m => m.AlbumsPageModule)
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AudioPageRoutingModule {}
