import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'snake',
    pathMatch: 'full',
  },
  {
    path: 'snake',
    loadChildren: () => import('../modules/snake/snake.module').then(m => m.SnakeModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
