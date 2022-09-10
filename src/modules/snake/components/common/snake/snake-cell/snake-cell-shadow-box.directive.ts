import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

const MAX_ELEMENTS_WITH_SHADOW = 9;

@Directive({
  selector: '[appSnakeCellShadowBox]'
})
export class SnakeCellShadowBoxDirective implements OnChanges {

  @Input() distanceFromHead = 0;

  @Input() hasElement = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let opacity = '0';
    let stretch = Math.abs(MAX_ELEMENTS_WITH_SHADOW - this.distanceFromHead);

    if (this.distanceFromHead <= MAX_ELEMENTS_WITH_SHADOW) {
      opacity = `.${stretch * 10}`;
    }


    if (this.hasElement) {
      this.renderer.setStyle(
        this.el.nativeElement, 'box-shadow', `0 0 ${30 - this.distanceFromHead}px ${stretch}px rgb(255, 255, 255, ${opacity})`
      );
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'box-shadow');
    }
  }

}
