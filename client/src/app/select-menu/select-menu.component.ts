import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';

@Component({
  selector: 'app-select-menu',
  templateUrl: './select-menu.component.html',
  styleUrls: ['./select-menu.component.css']
})
export class SelectMenuComponent {
  @Output() optionSelected = new EventEmitter<string>();
  @Output() clickedOutside = new EventEmitter<void>();
  @Input() options: string[] = [];
  @Input() disableCondition: (option : string) => boolean = () => false;
  

  display: boolean = false;

  constructor(private eRef: ElementRef) {}

  @HostListener('document:click')
  clickout() {
    this.display = false;
    this.clickedOutside.emit();
  }

  onSelect(value: string) {
    if (!this.disableCondition(value)){
      this.optionSelected.emit(value);
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
