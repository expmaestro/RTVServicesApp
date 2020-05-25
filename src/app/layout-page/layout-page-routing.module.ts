import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LayoutPagePage } from './layout-page.page';
import { AuthGuardService } from '../services/auth-guard.service';
import { ServicesPagePage } from '../services-page/services-page.page';
import { ChoiceComponent } from '../services-page/choice/choice.component';
import { PlayerPage } from '../player/player.page';

const routes: Routes = [
  { path: '', redirectTo: 'services', pathMatch: 'full' },
  {
    path: '',
    component: LayoutPagePage,
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
        path: 'profile',
        canActivate: [AuthGuardService],
        loadChildren: () => import('../profile/profile.module').then( m => m.ProfilePageModule)
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
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutPagePageRoutingModule {}
