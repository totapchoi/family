import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { PersonService } from './person.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public authService: AuthService, public userService: UserService, public personService: PersonService) { }
  menus = [
    { url: '/', text: 'Home', align: 'left' },
    { url: '/family', text: 'Family tree', align: 'left' },
    { url: '/search/person', text: 'Search', align: 'left' }
  ];

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.menus.push(
        { url: '/signin', text: 'Sign in', align: 'right' },
        { url: '/signup', text: 'Sign up', align: 'right' }
      );
    } else {
        this.personService.getCurrentPerson().subscribe(person=> {
        this.menus.push(
           {url: '/person/' +person.id, text: person.firstName + ' ' +  person.lastName, align : 'right'}
        )
      });
    }
  }
  signout() {
    this.authService.removeToken()
    window.location.reload()
  }
 
}
