import { Component, forwardRef, Output, EventEmitter, Input, HostListener, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';



@Component({
  selector: 'app-person-select',
  templateUrl: './person-select.component.html',
  styleUrls: ['./person-select.component.css'],
  providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PersonSelectComponent),
    multi: true
  }
  ]
})
export class PersonSelectComponent implements ControlValueAccessor {
  @Input() displayProperties: string[] = [];
  @Input() set persons(personss: any[]) {
    this.filteredPersons = [...personss];
  }
  @Output() search = new EventEmitter<string>();
  @Output() personSelected = new EventEmitter<any>();
  @Output() personUnselected = new EventEmitter<any>();

  value: string | null = '';
  showDropdown = true;
  selectedPerson: any;
  filteredPersons: any[] = [];
  private searchSubject: Subject<string> = new Subject();

  constructor(private eRef : ElementRef) {
    this.searchSubject.pipe(debounceTime(200)).subscribe(searchValue => {
      this.search.emit(searchValue);
    });
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  filterPerson(value: string) {
    this.searchSubject.next(value);
  }
  @HostListener('document:click', ['$event'])
  clickout(event : Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      if (this.showDropdown && this.value) {
        this.showDropdown = false;
        this.value = null;
      }
    } else {
      this.showDropdown = true;
    }
  }
  selectPerson(person: any) {
    this.selectedPerson = person;
    this.personSelected.emit(person);
    this.showDropdown = false;
    this.value = '';
  }

  
  toggleDropdown() {
    if(!(this.selectedPerson)){
      this.showDropdown = !this.showDropdown;
    }
  }

  getSelectedPersonProperties() {
    return this.displayProperties.map(property => this.selectedPerson[property]).join(' ');
  }

}