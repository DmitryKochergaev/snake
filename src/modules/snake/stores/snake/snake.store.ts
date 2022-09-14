import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Directions, IPosition, ISnake, ISnakeCell } from "../../models/snake.model";
import { filter, Observable, tap, withLatestFrom } from "rxjs";

export interface ISnakeState {
  cells: ISnakeCell[];
  snake: ISnake | null;
  currentDirection: Directions | null;
  hasBuff: boolean;
}

const LENGTH_X = 20; // todo make dynamic
const LENGTH_Y = 20;

@Injectable()
export class SnakeStore extends ComponentStore<ISnakeState> {

  public readonly cells$ = this.select(({ cells }) => cells);

  public readonly snake$ = this.select(({ snake }) => snake);

  public readonly hasBuff$ = this.select(({ hasBuff }) => hasBuff);

  constructor() {
    super({
      cells: [],
      snake: null,
      currentDirection: null,
      hasBuff: false,
    });

    this.onSnakeUpdate(this.snake$);
  }

  public readonly updateCells = this.updater((state, cells: ISnakeCell[]) => {
    return {
      ...state,
      hasBuff: true,
      cells,
    };
  });

  //todo canMove ?
  public readonly moveSnake = this.updater((state, newDirection: Directions) => {
    let validDirection = this.getValidDirection(state.currentDirection, newDirection);
    let { snake, isSnakeOnBuff } = this.getUpdatedSnake(state.snake, state.cells, validDirection);

    return {
      ...state,
      currentDirection: validDirection,
      hasBuff: !isSnakeOnBuff,
      snake,
    };
  });

  private getUpdatedSnake(snake: ISnake, cells: ISnakeCell[], direction: Directions) {
    let isSnakeOnBuff = false;

    snake.elementsPosition = snake.elementsPosition.map((el, index, arr) => {
      if (index === 0) {
        let moveContext = { isXAxis: true, isMovePositive: true, isOffsetPositive: true, x: 0, y: 0 };

        if (direction === 'up') {
          moveContext = { isXAxis: false, isMovePositive: false, isOffsetPositive: true, x: el.x, y: el.y };
        }
        if (direction === 'right') {
          moveContext = { isXAxis: true, isMovePositive: true, isOffsetPositive: false, x: el.x, y: el.y };
        }
        if (direction === 'down') {
          moveContext = { isXAxis: false, isMovePositive: true, isOffsetPositive: false, x: el.x, y: el.y };
        }
        if (direction === 'left') {
          moveContext = { isXAxis: true, isMovePositive: false, isOffsetPositive: true, x: el.x, y: el.y };
        }

        let headElPos = this.getHeadElementPosition(moveContext, LENGTH_X, LENGTH_Y, cells);

        if (cells.find(({ position, hasBuff }) =>
          position.x === headElPos.x && position.y === headElPos.y && hasBuff)) {
          isSnakeOnBuff = true;
        }

        return headElPos
      }
      return arr[index - 1];
    });

    return { snake: Object.assign({}, snake), isSnakeOnBuff };
  }

  private getHeadElementPosition({ isXAxis, isMovePositive, isOffsetPositive, x, y },
                                 offsetX: number, offsetY: number, cells: ISnakeCell[]): IPosition {
    let offset = isMovePositive ? 1 : -1;

    if (!cells.find(cell => cell.position.x === x + ((isXAxis ? 1 : 0) * isMovePositive ? 1 : -1)
      && cell.position.y === y + ((isXAxis ? 0 : 1) * isMovePositive ? 1 : -1))
    ) {
      offset += (isXAxis ? offsetX : offsetY) * (isOffsetPositive ? 1 : -1);
    }

    return isXAxis ? { x: x + offset, y: y } : { x: x, y: y + offset };
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
          hasBuff: false,
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
      elementsPosition.push({ x, y, distanceFromHead: i });
    }

    return elementsPosition;
  }

  private getUpdatedCells(cells: ISnakeCell[], snake: ISnake, hasBuff: boolean) {
    let updatedCells = cells.map(cell => {
      const snakeElementIndex = snake.elementsPosition.findIndex(el => cell.position.x === el.x && cell.position.y === el.y);

      return {
        ...cell,
        hasElement: snakeElementIndex !== -1,
        position: {
          ...cell.position,
          distanceFromHead: snakeElementIndex,
        }
      };
    });

    if (!hasBuff) {
      while (true) {
        let hasFoundCellToBuff = false;
        const x = Math.floor(Math.random() * LENGTH_X);
        const y = Math.floor(Math.random() * LENGTH_Y);

        for (let i = 0; i < cells.length; i++) {
          const tempCell = cells.findIndex(cell => cell.position.x === x && cell.position.y === y);
          if (tempCell !== -1 && !updatedCells[tempCell].hasElement) {
            updatedCells = updatedCells.map(el => ({...el, hasBuff: false}))
            updatedCells[tempCell].hasBuff = true;
            hasFoundCellToBuff = true;
            break;
          }
        }

        if (hasFoundCellToBuff) {
          break;
        }
      }
    }

    return updatedCells;
  }

  public readonly onSnakeUpdate = this.effect((snake$: Observable<ISnake>) => {
    return snake$.pipe(
      withLatestFrom(this.cells$, this.hasBuff$),
      filter(([, cells]) => !!cells.length),
      tap(([snake, cells, hasBuff]) => {
        this.updateCells(this.getUpdatedCells(cells, snake, hasBuff));
      }),
    );
  });

}




















