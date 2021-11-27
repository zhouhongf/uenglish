import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from './utils/auth.guard';

const routes: Routes = [
  {path: 'student', loadChildren: () => import('./student/student.module').then(m => m.StudentModule), canLoad: [AuthGuard]},
  {path: '', redirectTo: 'student', pathMatch: 'full'},
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {path: 'sysuser', loadChildren: () => import('./sysuser/sysuser.module').then(m => m.SysuserModule), canLoad: [AuthGuard]},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
    // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
