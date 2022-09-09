import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Directions, IPosition, ISnake, ISnakeCell } from "../../models/snake.model";
import { Observable, tap, withLatestFrom } from "rxjs";

export interface ISnakeState {
  cells: ISnakeCell[];
  snake: ISnake | null;
  currentDirection: Directions | null;
}

const LENGTH_X = 16; // todo make dynamic
const LENGTH_Y = 17;

@Injectable()
export class SnakeStore extends ComponentStore<ISnakeState> {

  public readonly cells$ = this.select(({ cells }) => cells);

  public readonly snake$ = this.select(({ snake }) => snake);

  constructor() {
    super({
      cells: [],
      snake: null,
      currentDirection: null,
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
  public readonly moveSnake = this.updater((state, newDirection: Directions) => {
    let validDirection = this.getValidDirection(state.currentDirection, newDirection);

    return {
      ...state,
      currentDirection: validDirection,
      snake: this.getUpdatedSnake(state.snake, state.cells, validDirection),
    };
  });

  private getUpdatedSnake(snake: ISnake, cells: ISnakeCell[], direction: Directions) {
    snake.elementsPosition = snake.elementsPosition.map((el, index, arr) => {
      if (index === 0) {
        let offset = 0;
        //todo optimize smh ?

        if (direction === 'up') {
          if (!cells.find(cell => cell.position.x === el.x && cell.position.y === el.y - 1)) {
            offset = LENGTH_Y;
          }
          return { x: el.x, y: el.y - 1 + offset };
        }
        if (direction === 'right') {
          if (!cells.find(cell => cell.position.x === el.x + 1 && cell.position.y === el.y)) {
            offset = -LENGTH_X;
          }
          return { x: el.x + 1 + offset, y: el.y };
        }
        if (direction === 'down') {
          if (!cells.find(cell => cell.position.x === el.x && cell.position.y === el.y + 1)) {
            offset = -LENGTH_Y;
          }
          return { x: el.x, y: el.y + 1 + offset };
        }
        if (direction === 'left') {
          if (!cells.find(cell => cell.position.x === el.x - 1 && cell.position.y === el.y)) {
            offset = LENGTH_X;
          }
          return { x: el.x - 1 + offset, y: el.y };
        }
      }
      return arr[index - 1];
    });

    return Object.assign({}, snake);
  }

  private getCellsOffset({ x, y }: IPosition, offsetLength: number, cells: ISnakeCell[]) {
    let offset = 0;

    if (!cells.find(cell => cell.position.x === x && cell.position.y === y)) {
      offset = offsetLength;
    }

    return offset;
  }

  private getValidDirection(currentDirection: Directions, newDirection: Directions): Directions {
    //todo make ENUM of opposites direction in model
    if (currentDirection === 'up' && newDirection === 'down'
      || currentDirection === 'right' && newDirection === 'left'
      || currentDirection === 'down' && newDirection === 'up'
      || currentDirection === 'left' && newDirection === 'right'
    ) {
      return currentDirection;
    }

    return newDirection;
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
      hasElement: Boolean(snake.elementsPosition.find(el => cell.position.x === el.x && cell.position.y === el.y)),
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




















