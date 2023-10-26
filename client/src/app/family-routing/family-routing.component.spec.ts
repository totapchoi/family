import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyRoutingComponent } from './family-routing.component';

describe('FamilyRoutingComponent', () => {
  let component: FamilyRoutingComponent;
  let fixture: ComponentFixture<FamilyRoutingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FamilyRoutingComponent]
    });
    fixture = TestBed.createComponent(FamilyRoutingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
