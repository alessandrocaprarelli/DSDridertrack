import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { LoginPageComponent } from './authentication/login-page/login-page.component';
import { RegistrationPageComponent } from './authentication/registration-page/registration-page.component';
import { ParticipantPageComponent } from './user-pages/participant-page/participant-page.component';
import { CountDownComponent } from './user-pages/count-down/count-down.component';
import { EventAdminPageComponent } from './event-pages/event-admin-page/event-admin-page.component';
import { HeaderConnectComponent } from './shared/layout/header-connect/header-connect.component';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';
import { EventsListPageComponent } from './event-pages/events-list-page/events-list-page.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { ContactsPageComponent } from './contacts-page/contacts-page.component';
import { PageHeaderComponent } from './shared/layout/page-header/page-header.component';
import {EventDetailPageComponent} from './event-pages/event-detail-page/event-detail-page.component';
import { MyEventsComponent } from './event-pages/my-events/my-events.component';

import {UserService} from './shared/services/user.service';
import {AuthenticationService} from './authentication/authentication.service';

import {GuestGuard} from './shared/guards/guest.guard';
import {AuthGuard} from './shared/guards/auth.guard';


import { FacebookModule } from 'ngx-facebook';
import {AuthService} from 'angular2-google-login';
import {EventService} from "./shared/services/event.service";



@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    LoginPageComponent,
    RegistrationPageComponent,
    ParticipantPageComponent,
    CountDownComponent,
    EventAdminPageComponent,
    HeaderConnectComponent,
    NavbarComponent,
    EventsListPageComponent,
    FooterComponent,
    ContactsPageComponent,
    PageHeaderComponent,
    EventDetailPageComponent,
    MyEventsComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    FacebookModule.forRoot(),
    RouterModule.forRoot([
      {
        path: '',
        component:  HomePageComponent,
        pathMatch: 'full'
      } ,
      {
        path: 'events',
        component: EventsListPageComponent
      },
      {
        path: 'product-details/:id',
        component: EventDetailPageComponent
      },
      {
        path: 'contacts',
        component: ContactsPageComponent
      },
      {
        path: 'login',
        component: LoginPageComponent,
        canActivate: [GuestGuard]
      } ,
      {
        path: 'register',
        component: RegistrationPageComponent,
        canActivate: [GuestGuard]
      } ,
      {
        path: 'my-events',
        component: MyEventsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: '**',
        redirectTo: '/home',
        pathMatch: 'full'
      }
    ]),
    HttpModule
  ],
  providers: [
    UserService,
    EventService,
    AuthGuard,
    GuestGuard,
    AuthenticationService,
    AuthService
   ],
  bootstrap: [AppComponent]
})
export class AppModule { }

