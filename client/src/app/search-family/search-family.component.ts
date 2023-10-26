import { Component } from '@angular/core';

@Component({
  selector: 'app-search-family',
  templateUrl: './search-family.component.html',
  styleUrls: ['./search-family.component.css']
})
export class SearchFamilyComponent {
  menus = [
    {url: '/search/person', text: 'Person', align: 'left'},
    {url: '/search/family', text: 'Family', align: 'left'}
  ]
}
