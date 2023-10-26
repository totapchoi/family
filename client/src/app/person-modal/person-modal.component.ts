import { Component, OnInit, Inject,  } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonService } from '../person.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogService } from '../dialog.service';




@Component({
  selector: 'app-person-modal',
  templateUrl: './person-modal.component.html',
  styleUrls: ['./person-modal.component.css']
})
export class PersonModalComponent implements OnInit {
  personForm: FormGroup;
  id: number;
  uploadImage: any;
  uploadedImageUrl: any;
  person: any;
  option: string;
  constructor(
    private dialogService :DialogService,
    public dialogRef: MatDialogRef<PersonModalComponent>,
    private fb: FormBuilder,
    private personService: PersonService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ) {
    this.id = data.person?.id;
    this.option = data.option;
    this.uploadedImageUrl = 'assets/default.jpeg';
    this.personForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      birthyear: ['', Validators.required],
      living: ['living', Validators.required],
      public: ['public', Validators.required],
    });
  }

  ngOnInit() {
    if (this.option == "Edit Info") {
      this.personForm.patchValue({
        firstName: this.data.person?.firstName,
        lastName: this.data.person?.lastName,
        gender: this.data.person?.gender,
        birthyear: this.data.person?.birthyear
      });
      this.uploadedImageUrl = this.data.person?.imageURL;
  
      // Fetch the image file from the URL
      fetch(this.uploadedImageUrl)
        .then(response => response.blob())
        .then(blob => {
          // Create a file from the blob
          this.uploadImage = new File([blob], this.data.person?.image || 'default_image_name', { type: 'image/jpeg' });
        });
    }
  }
  

  getSelectedFile(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.uploadImage = file;
      this.uploadedImageUrl = URL.createObjectURL(file); // Assign the URL to the property
    } else {
      this.uploadImage = null;
      this.uploadedImageUrl = ''; // Clear the URL if no file is selected
    }
  }

  onSubmit() {

    const person = this.personForm.value;
    if (this.option == "Edit Info") {
      this.personService.editPerson(this.id, person, this.uploadImage).subscribe({
        next: (response) => {
          console.log(response);
          this.dialogRef.close();
          this.dialogService.messageDialog("Edit Succesfully")
        },
        error: (error) => {
          console.error(error);
        }
      })
    }
    if (this.option == "Add Children") {
      this.personService.addChildren(this.id, person, this.uploadImage).subscribe({
        next : (response) => {
          console.log(response);
          this.dialogRef.close();
          this.dialogService.messageDialog("Add Children Succesfully")
        }
      })
    }
    if (this.option == "Add Parent") {
      this.personService.addParent(this.id, person, this.uploadImage).subscribe({
        next : (response) => {
          console.log(response);
          this.dialogRef.close();
          this.dialogService.messageDialog("Add Parent Succesfully")
        }
      })
    }
    if (this.option == "Add Partner"){
      this.personService.addPartner(this.id, person, this.uploadImage).subscribe({
        next : (response) => {
          console.log(response);
          this.dialogRef.close();
          this.dialogService.messageDialog("Add Partner Succesfully")
        }
      })
    }


  }
  confirm () {
    this.dialogService.confirmDialog('Confirm ' + this.option.toLowerCase() +" ?").subscribe(confirmed => {
      if (confirmed){
        this.onSubmit();
      }
    })
  }
  onCancel() {
    this.dialogRef.close();
  }
}