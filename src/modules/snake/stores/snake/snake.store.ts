import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Directions, IPosition, ISnake, ISnakeCell } from "../../models/snake.model";
import { filter, Observable, tap, withLatestFrom } from "rxjs";
import copy from "fast-copy";

export interface ISnakeState {
  cells: ISnakeCell[];
  snake: ISnake | null;
  previousSnake: ISnake | null;
  currentDirection: Directions | null;
}

const LENGTH_X = 20; // todo make dynamic
const LENGTH_Y = 20;

@Injectable()
export class SnakeStore extends ComponentStore<ISnakeState> {

  public readonly cells$ = this.select(({ cells }) => cells);

  public readonly snake$ = this.select(({ snake }) => snake);

  constructor() {
    super({
      cells: [],
      snake: null,
      previousSnake: null,
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
    let snakeCopy = copy(state.snake);

    return {
      ...state,
      currentDirection: validDirection,
      previousSnake: snakeCopy,
      snake: this.getUpdatedSnake(state.snake, state.cells, validDirection),
    };
  });

  public readonly increaseSnake = this.updater((state) => {
    return {
      ...state,
      snake: this.getIncreasedSnake(state.snake, state.previousSnake),
    };
  });

  private getIncreasedSnake(snake: ISnake, previousSnake: ISnake) {
    snake.elementsPosition.push(previousSnake.elementsPosition[previousSnake.elementsPosition.length - 1]);
    return Object.assign({}, snake);
  }

  private getUpdatedSnake(snake: ISnake, cells: ISnakeCell[], direction: Directions) {
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

        return this.getHeadElementPosition(moveContext, LENGTH_X, LENGTH_Y, cells);
      }
      return arr[index - 1];
    });

    return Object.assign({}, snake);
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

  private getCellsUpdatedBuffAndPositions(cells: ISnakeCell[], snake: ISnake) {
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
    let isSnakeOnBuff = false;
    let cellsWithBuff = updatedCells.filter(({ hasBuff }) => hasBuff);

    if (cellsWithBuff.length) {
      snake.elementsPosition.forEach(({ x, y }) => {
        if (cellsWithBuff[0].position.x === x && cellsWithBuff[0].position.y === y) {
          isSnakeOnBuff = true;
        }
      });
    }

    if (isSnakeOnBuff || !cellsWithBuff.length) {
      while (true) {
        let hasFoundCellToBuff = false;
        const randomX = Math.floor(Math.random() * LENGTH_X);
        const randomY = Math.floor(Math.random() * LENGTH_Y);

        for (let i = 0; i < cells.length; i++) {
          const tempCellIndex = cells.findIndex(cell => cell.position.x === randomX && cell.position.y === randomY);
          if (tempCellIndex !== -1 && !updatedCells[tempCellIndex].hasElement) {
            updatedCells = updatedCells.map((el, index) => ({
              ...el,
              hasBuff: index === tempCellIndex
            }));
            hasFoundCellToBuff = true;
            break;
          }
        }

        if (hasFoundCellToBuff) {
          break;
        }
      }
    }

    return { isSnakeOnBuff, updatedCells };
  }

  public readonly onSnakeUpdate = this.effect((snake$: Observable<ISnake>) => {
    return snake$.pipe(
      withLatestFrom(this.cells$),
      filter(([, cells]) => !!cells.length),
      tap(([snake, cells]) => {
        let { isSnakeOnBuff, updatedCells } = this.getCellsUpdatedBuffAndPositions(cells, snake);

        this.updateCells(updatedCells);

        if (isSnakeOnBuff) {
          this.increaseSnake();
        }
      }),
    );
  });

}




















