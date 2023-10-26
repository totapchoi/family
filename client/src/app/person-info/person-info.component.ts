import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, catchError, throwError  } from 'rxjs';
import { PersonService } from '../person.service';
import { ModalService } from '../modal.service';
import { DialogService } from '../dialog.service';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';



@Component({
  selector: 'app-person-info',
  templateUrl: './person-info.component.html',
  styleUrls: ['./person-info.component.css']
})
export class PersonInfoComponent implements OnInit{
  id : number = 0;
  person : any;
  currentPerson : any;
  parents? : any[];
  children? : any[];
  partner? : any;
  imageUrl : any;
  constructor(
    private route : ActivatedRoute,
    private router : Router,
    private personService : PersonService,
    private modalService :ModalService,
    private dialogService : DialogService,
    private authService :AuthService
  ){}
  subcription! : Subscription;
  ngOnInit() {
    this.subcription = this.route.params.subscribe(params => {
      this.id = +params['id'];
      this.personService.getPersonById(this.id).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.dialogService.messageDialog('No person match with this id');
            this.router.navigate(['/home']);
          }
          return throwError(() => error);
        })
      ).subscribe(person => {
        this.person = person;
        console.log(this.person);
        this.imageUrl = person.imageURL;
        if (this.person.partner_id) {
          this.personService.getPersonById(this.person.partner_id).subscribe(partner => {
            this.partner = partner;
          })
        }
      });
      
      this.personService.getParents(this.id).subscribe(parents =>{
        this.parents = parents
        
      })
      this.personService.getChildren(this.id).subscribe(children =>{
        this.children = children;
        
      })
      this.personService.getCurrentPerson().subscribe(person =>{
        this.currentPerson = person;
        console.log(this.currentPerson)
      })

    })
  }
  editPerson() {
    this.modalService.openPerson(this.person, "Edit Info")
  }
  addChildren() {
    this.modalService.openPerson(this.person,"Add Children")
  }
  gotoTree() {
    this.router.navigate(['/family/' +this.person?.family_id])
  }
  navigate(id : number){
    this.router.navigate(['/person/' + id])
  .then(() => {
    window.location.reload();
  });

  }
  isAuthorize() : boolean {
    return this.person?.id === this.currentPerson?.id;
  }
  signout(){
    this.authService.removeToken();
    this.router.navigate(['/home'], { queryParams: { reload: true } });
  }
 
}
