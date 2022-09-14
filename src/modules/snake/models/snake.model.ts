export interface ISnake {
  elementsPosition: IPosition[];
}

export interface ISnakeCell {
  hasElement: boolean;
  hasBuff: boolean;
  position: IPosition;
}

export interface IPosition {
  x: number;
  y: number;
  distanceFromHead?: number;
}

export type Directions = 'up' | 'right' | 'down' | 'left';

