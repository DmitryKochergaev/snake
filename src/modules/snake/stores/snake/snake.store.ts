import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Directions, IPosition, ISnake, ISnakeCell } from "../../models/snake.model";
import {  Observable, tap, withLatestFrom } from "rxjs";

export interface ISnakeState {
  cells: ISnakeCell[];
  snake: ISnake | null;
}

const LENGTH_X = 16; // todo make dynamic

@Injectable()
export class SnakeStore extends ComponentStore<ISnakeState> {

  public readonly cells$ = this.select(({ cells }) => cells);

  public readonly snake$ = this.select(({ snake }) => snake);

  constructor() {
    super({
      cells: [],
      snake: null,
    });

    this.onSnakeUpdate(this.snake$);
  }

  public readonly updateCells = this.updater((state, cells: ISnakeCell[]) => {
    return {
      ...state,
      cells,
    };
  });

  //todo canMove ?
  public readonly moveSnake = this.updater((state, direction: Directions) => {
    return {
      ...state,
      snake: this.getUpdatedSnake(state.snake, direction),
    };
  });

  private getUpdatedSnake(snake: ISnake, direction: Directions) {
    snake.elementsPosition = snake.elementsPosition.map((el, index, arr) => {
      if (index === 0) {
        if (direction === 'up') {
          return { x: el.x, y: el.y - 1 };
        }
        if (direction === 'right') {
          return { x: el.x + 1, y: el.y };
        }
        if (direction === 'down') {
          return { x: el.x, y: el.y + 1 };
        }
        if (direction === 'left') {
          return { x: el.x - 1, y: el.y };
        }
      }
      return arr[index - 1];
    });

    return Object.assign({}, snake);
  }

  public setCells(length: number): void {
    let x = 0;
    let y = 0;

    this.patchState({
      cells: Array.from(Array(length), () => {
        if (x >= LENGTH_X) {
          x = 0;
          y++;
        }

        return {
          hasElement: false,
          position: { x: x++, y }
        };
      })
    });
  }

  public setSnake(length: number, startX: number, startY: number,): void {
    this.patchState(({ cells }) => ({
      snake: {
        elementsPosition: this.getInitialElementsPosition(length, startX, startY, cells)
      }
    }));
  }

  // todo edge cases (with Y ??)
  private getInitialElementsPosition(length: number, x: number, y: number, cells: ISnakeCell[]): IPosition[] {
    let elementsPosition: IPosition[] = [];
    let maxX = Math.max(...cells.map(cell => cell.position.x));

    for (let i = 0; i < length; i++) {
      if (x > maxX) {
        x = 0;
        y++;
      } else {
        x++;
      }
      elementsPosition.push({ x, y });
    }

    return elementsPosition;
  }

  private getUpdatedCells(cells: ISnakeCell[], snake: ISnake) {
    return cells.map(cell => ({
      ...cell,
      hasElement: snake.elementsPosition.findIndex(el => cell.position.x === el.x && cell.position.y === el.y) !== -1,
    }));
  }

  public readonly onSnakeUpdate = this.effect((snake$: Observable<ISnake>) => {
    return snake$.pipe(
      withLatestFrom(this.cells$),
      tap(([snake, cells]) => {
        this.updateCells(this.getUpdatedCells(cells, snake));
      }),
    );
  });

}




















