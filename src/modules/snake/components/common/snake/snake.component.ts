import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { SnakeStore } from "../../../stores/snake/snake.store";
import { interval, Subject, takeUntil, tap } from "rxjs";
import { Directions } from "../../../models/snake.model";

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss'],
  providers: [SnakeStore]
})
export class SnakeComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() speed = 600;

  public cells$ = this.snakeStore.cells$;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  private direction: Directions = 'left';

  constructor(private snakeStore: SnakeStore) {
  }

  ngOnInit(): void {
    this.snakeStore.setCells(272); //todo adaptive
    this.snakeStore.setSnake(8, 5, 5);
  }

  ngAfterViewInit(): void {
    this.startGame();
  }

  private startGame(): void {
    interval(this.speed).pipe(
      tap(() => this.draw()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private draw(): void {
    this.snakeStore.moveSnake(this.direction);
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {//todo naming
    switch (event.key) {
      case 'ArrowUp':
        this.direction = 'up';
        break;
      case 'ArrowRight':
        this.direction = 'right';
        break;
      case 'ArrowDown':
        this.direction = 'down';
        break;
      case 'ArrowLeft':
        this.direction = 'left';
        break;
      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


}
