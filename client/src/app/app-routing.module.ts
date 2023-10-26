import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { FamilyComponent } from './family/family.component';
import { FamilyRoutingComponent } from './family-routing/family-routing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchFamilyComponent } from './search-family/search-family.component';
import { SearchPersonComponent } from './search-person/search-person.component';
import { PersonInfoComponent } from './person-info/person-info.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'signin', component: SigninComponent},
  { path: 'signup', component: SignupComponent},
  { path: 'family', component : FamilyRoutingComponent},
  { path: 'family/:id', component : FamilyComponent},
  { path: 'home', component : DashboardComponent},
  { path: 'search/family', component: SearchFamilyComponent},
  { path: 'search/person', component: SearchPersonComponent},
  { path: 'person/:id', component: PersonInfoComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
