import { Component, Output, EventEmitter,  Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.css']
})
export class InputDialogComponent {
  @Output() valueEntered: EventEmitter<string> = new EventEmitter<string>();
  inputValue: string = '';
  constructor(
    public dialogRef: MatDialogRef<InputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any){}
  onEnter() {
    this.valueEntered.emit(this.inputValue);
    this.dialogRef.close();
  }
}
