import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTreeModule } from '@angular/material/tree';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SigninComponent } from './signin/signin.component';
import { SignupComponent } from './signup/signup.component';
import { AuthInterceptor } from './auth.interceptor';
import { HeaderComponent } from './header/header.component';
import { PersonModalComponent } from './person-modal/person-modal.component';
import { ModalService } from './modal.service';
import { FamilyRoutingComponent } from './family-routing/family-routing.component';
import { FamilyComponent } from './family/family.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectMenuComponent } from './select-menu/select-menu.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { InputDialogComponent } from './input-dialog/input-dialog.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SearchPersonComponent } from './search-person/search-person.component';
import { SearchFamilyComponent } from './search-family/search-family.component';
import { PersonSelectComponent } from './person-select/person-select.component';
import { PersonInfoComponent } from './person-info/person-info.component';



@NgModule({
  declarations: [
    AppComponent,
    SigninComponent,
    SignupComponent,
    HeaderComponent,
    PersonModalComponent,
    FamilyRoutingComponent,
    FamilyComponent,
    SelectMenuComponent,
    ConfirmDialogComponent,
    MessageDialogComponent,
    InputDialogComponent,
    DashboardComponent,
    SearchPersonComponent,
    SearchFamilyComponent,
    PersonSelectComponent,
    PersonInfoComponent,
   
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatDialogModule,
    MatTreeModule,
    BrowserAnimationsModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule
    
  ],
  providers: [
    {
      provide : HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi   : true,
    },
    ModalService
  ],
  bootstrap: [AppComponent],
  
})
export class AppModule { }
