import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { RegistrationPageComponent } from './registration-page/registration-page.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ParticipantPageComponent } from './participant-page/participant-page.component';
import { EventAdminPageComponent } from './event-admin-page/event-admin-page.component';
import { HeaderConnectComponent } from './header-connect/header-connect.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    LoginPageComponent,
    RegistrationPageComponent,
    AboutUsComponent,
    ParticipantPageComponent,
    EventAdminPageComponent,
    HeaderConnectComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: 'home',
        component:  HomePageComponent
      } ,
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
      } ,
      {
        path: 'login',
        component: LoginPageComponent
      } ,
      {
        path: 'register',
        component: RegistrationPageComponent
      } ,
      {
        path: 'participant',
        component: ParticipantPageComponent
      } ,
      {
        path: 'event-admin',
        component: EventAdminPageComponent
      } ,
      {
        path: 'about-us',
        component: AboutUsComponent
      }
    ]),
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
