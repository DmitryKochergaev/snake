import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaygroundComponent } from "./playground.component";

describe('PlaygroundComponent', () => {
  let fixture: ComponentFixture<PlaygroundComponent>;
  let component: PlaygroundComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [],
      declarations: [
        PlaygroundComponent
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaygroundComponent);
    component = fixture.componentInstance;
  });

  it('should be truthy', () => {
    console.log('component', component);
    expect(component).toBeTruthy();
  });
});
