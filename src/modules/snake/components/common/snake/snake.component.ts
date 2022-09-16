import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy } from '@angular/core';
import { SnakeStore } from "../../../stores/snake/snake.store";
import { Directions } from "../../../models/snake.model";
import { BehaviorSubject, combineLatest, filter, interval, takeUntil, tap } from "rxjs";

@Component({
  selector: 'app-snake',
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.scss'],
  providers: [SnakeStore]
})
export class SnakeComponent implements AfterViewInit, OnDestroy {

  @Input() public speed = 500;

  public cells$ = this.snakeStore.cells$;

  private destroy$ = new BehaviorSubject<boolean>(false);

  private gameIntervalStopper$ = combineLatest([this.destroy$, this.snakeStore.isGameLost$]).pipe(
    filter(([destroyed, gameLost]) => destroyed || gameLost),
  );

  private direction: Directions = 'left';

  constructor(private snakeStore: SnakeStore, private cdr: ChangeDetectorRef) {
  }

  //todo setting on the right
  //sliding out like in site-card project, but from left corner
  //score
  //stop/start/pause buttons
  //increase speed by length of the snake ?
  //double pressed buttons move ???
  //try transition time in open 2 user settings
  //add fireworks on snake increase
  public ngAfterViewInit(): void {
    this.startGame();
  }

  public trackBy(index) {
    return index;
  }

  private startGame(): void {
    this.snakeStore.setCells(400); //todo adaptive
    this.snakeStore.setSnake(3, 5, 5);
    this.snakeStore.setGameState('on');

    interval(this.speed).pipe(
      tap(() => this.tick()),
      takeUntil(this.gameIntervalStopper$),
    ).subscribe();

    this.cdr.detectChanges();
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
