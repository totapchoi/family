import { Component, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent {
  @Output() confirmed = new EventEmitter<boolean>();

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    dialogRef.backdropClick().subscribe(() => this.onNoClick());
  }

  onYesClick() {
    this.confirmed.emit(true);
    this.dialogRef.close();
  }

  onNoClick() {
    this.confirmed.emit(false);
    this.dialogRef.close();
  }

 
}
