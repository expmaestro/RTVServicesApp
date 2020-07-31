import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage as TabsPage } from './tabs.page';
import { AuthGuardService } from '../services/auth-guard.service';
import { ServicesPagePage } from '../services-page/services-page.page';
import { ChoiceComponent } from '../services-page/choice/choice.component';
import { PlayerPage } from '../player/player.page';
import { HomePage } from '../home/home.page';
import { AlbumsPage } from '../audio/albums/albums.page';
import { AudioPage } from '../audio/audio.page';

const routes: Routes = [
  { path: '', redirectTo: '/tabs/services', pathMatch: 'full' },
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'services',
        canActivate: [AuthGuardService],
        children: [
          {
            path: '',
            component: ServicesPagePage,
            loadChildren: () => import('../services-page/services-page.module').then(m => m.ServicesPagePageModule),
          },
          {
            path: 'player',
            canActivate: [AuthGuardService],
            children: [
              {
                path: '**',
                component: PlayerPage,
                loadChildren: () => import('../player/player.module').then(m => m.PlayerPageModule),
              },
            ]
          },
          {
            path: ':id',
            component: ChoiceComponent,
            loadChildren: () => import('../services-page/services-page.module').then(m => m.ServicesPagePageModule),
          },
          {
            // path: ':id/:childId',
            path: '**',
            component: ChoiceComponent,
            loadChildren: () => import('../services-page/services-page.module').then(m => m.ServicesPagePageModule),
          },
        ]
      },
      {
        path: 'audio',
        canActivate: [AuthGuardService],
       // loadChildren: () => import('../audio/audio.module').then(m => m.AudioPageModule),
        children: [
          {
            path: '',
            component: AudioPage,
            loadChildren: () => import('../audio/audio.module').then(m => m.AudioPageModule),
          },
          {
            path: 'albums/:type',
            component: AlbumsPage,
            loadChildren: () => import('../audio/albums/albums.module').then(m => m.AlbumsPageModule)
          }
        ]
      },
      {
        path: 'profile',
        canActivate: [AuthGuardService],
        loadChildren: () => import('../profile/profile.module').then(m => m.ProfilePageModule)
      },
      // {
      //   path: 'player',
      //   canActivate: [AuthGuardService],
      //   children: [
      //     {
      //       path: '**',
      //       component: PlayerPage,
      //       loadChildren: () => import('../player/player.module').then(m => m.PlayerPageModule),
      //     },
      //   ]
      // },
      {
        path: 'home',
        canActivate: [AuthGuardService],
        children: [
          {
            path: '**',
            component: HomePage,
            loadChildren: () => import('../home/home.module').then(m => m.HomePageModule),
          },
        ]
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule { }
