import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { PersonService } from '../person.service';
import { Router } from '@angular/router';
import { FamilyService } from '../family.service';
import { DialogService } from '../dialog.service';


@Component({
  selector: 'app-family-routing',
  templateUrl: './family-routing.component.html',
  styleUrls: ['./family-routing.component.css']
})
export class FamilyRoutingComponent {
  person : any;
  message = 'You do not have a family tree, Create one?';
  constructor(
    private userService: UserService,
    private personService: PersonService,
    private router: Router,
    private familyService: FamilyService,
    private dialogService: DialogService,
   
  ) {}
  
  ngOnInit() {
  
    this.personService.getCurrentPerson().subscribe(person => {
      this.person = person;
      if (person.family_id) {
        this.router.navigate(['/family/' + person.family_id]);
      } else {
        this.dialogService.confirmDialog(this.message).subscribe(confirmed => {
          if (confirmed) {
            console.log(this.message);
            this.familyService.create(this.person.id).subscribe((response: any) => {
              this.dialogService.messageDialog('You have created a family tree')
              this.router.navigate(['/family/' + response.family_id]);
            });
          } else{
            this.router.navigate(['/']);
          }
        });
        
        
      }
    });
  }
}
