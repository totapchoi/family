import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  confirmDialog(message: string): Observable<boolean> {
    console.log(message)
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: { message }
    });
  
    return dialogRef.componentInstance.confirmed;
  }
  messageDialog(message: string){
    this.dialog.open(MessageDialogComponent, {
      width: '100px',
      data: { message }
    })
  }
  inputDialog(message: string): Observable<string> {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '250px',
      data: { message },
    });
  
    return dialogRef.componentInstance.valueEntered;
  }
}
