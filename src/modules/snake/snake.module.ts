import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaygroundComponent } from './components/pages/playground/playground.component';
import { SnakeComponent } from './components/common/snake/snake.component';
import { RouterModule } from "@angular/router";
import { SnakeCellComponent } from './components/common/snake/snake-cell/snake-cell.component';
import { SnakeCellShadowBoxDirective } from './components/common/snake/snake-cell/snake-cell-shadow-box.directive';


@NgModule({
  declarations: [
    PlaygroundComponent,
    SnakeComponent,
    SnakeCellComponent,
    SnakeCellShadowBoxDirective
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: PlaygroundComponent,
      }
    ])
  ]
})
export class SnakeModule {
}
