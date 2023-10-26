import { Component ,ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PersonService } from '../person.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-search-person',
  templateUrl: './search-person.component.html',
  styleUrls: ['./search-person.component.css']
})
export class SearchPersonComponent {
  @ViewChild('dropdownMenu', { static: false }) dropdownMenu?: ElementRef;
  menus = [
    {url: '/search/person', text: 'Person', align: 'left'},
    {url: '/search/family', text: 'Family', align: 'left'}
  ]
  id : number = 0;
  persons : any[] = [];
  searchControl = new FormControl();
  filteredPersons : any[] = [];
  
  constructor(private personService : PersonService, private eRef : ElementRef,private router: Router){}
  
  searchPersons(searchValue : string): void{
    this.personService.search(searchValue).subscribe((persons) =>{
      this.persons = persons;
    })
  }
  selectPerson(person : any){
    this.id = person.id;
    console.log("something")
    this.router.navigate(['person/' + this.id])
  }


}
