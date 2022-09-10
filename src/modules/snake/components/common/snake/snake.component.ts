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

  @Input() public speed = 300;

  public cells$ = this.snakeStore.cells$;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  private direction: Directions = 'left';

  constructor(private snakeStore: SnakeStore) {
  }

  public ngOnInit(): void {
    this.snakeStore.setCells(400); //todo adaptive
    this.snakeStore.setSnake(14, 5, 5);
  }

  public ngAfterViewInit(): void {
    this.startGame();
  }

  public trackBy(index) {
    return index;
  }

  private startGame(): void {
    interval(this.speed).pipe(
      tap(() => this.tick()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private tick(): void {
    this.snakeStore.moveSnake(this.direction);
  }

  @HostListener('document:keydown', ['$event'])
  private onKeyboardPress(event: KeyboardEvent) {
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

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
