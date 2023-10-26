import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PersonModalComponent } from './person-modal/person-modal.component';
import { Subject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class ModalService {
  dialogRefs: MatDialogRef<any>[] = [];
  private onCloseSubject = new Subject<void>();
  onClose$ = this.onCloseSubject.asObservable();

  constructor(private dialog: MatDialog) {}

  openPerson(person: any, option: string) {
    this.closeAll();
    const dialogRef = this.dialog.open(PersonModalComponent, {
      data: { person, option },
      width:'500px'
    });

    this.dialogRefs.push(dialogRef);

    dialogRef.afterClosed().subscribe(result => {
      const index = this.dialogRefs.indexOf(dialogRef);
      if (index > -1) {
        this.dialogRefs.splice(index, 1);
      }
      this.onCloseSubject.next(); // Emit the next value when the dialog is closed
    });

    return dialogRef;
  }

  closeAll() {
    while (this.dialogRefs.length) {
      this.dialogRefs[0].close();
    }
  }
}
