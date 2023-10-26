import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonInfoComponent } from './person-info.component';

describe('PersonInfoComponent', () => {
  let component: PersonInfoComponent;
  let fixture: ComponentFixture<PersonInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PersonInfoComponent]
    });
    fixture = TestBed.createComponent(PersonInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
