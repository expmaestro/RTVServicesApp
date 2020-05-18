import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from './services/auth-guard.service';
import { ServicesPagePage } from './services-page/services-page.page';
import { ChoiceComponent } from './services-page/choice/choice.component';
import { PlayerPage } from './player/player.page';

const routes: Routes = [
  { path: '', redirectTo: 'services', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'services',
    canActivate: [AuthGuardService],
    children: [
      {
        path: '',
        component: ServicesPagePage,
        loadChildren: () => import('./services-page/services-page.module').then(m => m.ServicesPagePageModule),
      },
      {
        path: ':id',
        component: ChoiceComponent,
        loadChildren: () => import('./services-page/services-page.module').then(m => m.ServicesPagePageModule),
      },
      {
        // path: ':id/:childId',
        path: '**',
        component: ChoiceComponent,
        loadChildren: () => import('./services-page/services-page.module').then(m => m.ServicesPagePageModule),
      },
    ]
  },

  // {
  //   path: 'services',
  //   canActivate: [AuthGuardService],
  //   loadChildren: () => import('./services-page/services-page.module').then(m => m.ServicesPagePageModule),
  // },

  {
    path: 'player',
    canActivate: [AuthGuardService],
  //  loadChildren: () => import('./player/player.module').then(m => m.PlayerPageModule),
    children: [
      {
        path: '**',
        component: PlayerPage,
        loadChildren: () => import('./player/player.module').then(m => m.PlayerPageModule),
      },
    ]
  },
  {
    path: 'profile',
    canActivate: [AuthGuardService],
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  }


  // {
  //   path: 'player',
  //   canActivate: [AuthGuardService],
  //   loadChildren: () => import('./player/player.module').then(m => m.PlayerPageModule)
  // },


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
