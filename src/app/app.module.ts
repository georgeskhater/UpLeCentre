import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, LOCALE_ID, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule, Tabs } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { MyApp } from "./app.component";
import { HomePage } from "../pages/home/home";
import { LottieAnimationViewModule } from "ng-lottie";
import { RegisterPage } from "../pages/register/register";
import { NativePageTransitions } from "@ionic-native/native-page-transitions";
import { ApiService } from "../service/api-service";
import { AngularFireModule } from "angularfire2";
import { FIREBASE_CONFIG } from "./app.firebase.config";
import { AngularFireAuthModule } from "angularfire2/auth";
import { Interceptor } from "../service/http-interceptor";
import { CacheModule } from "ionic-cache";
import { StorageService } from "../service/cache";
import { CookieService } from "angular2-cookie/core";
import { LoginPage } from "../pages/login/login";
import { OnboardingPage } from "../pages/onboarding/onboarding";
import { UsersPage } from "../pages/users/users";
import { AddStudentPage } from "../pages/add-student/add-student";
import { NavService } from "../service/nav-service";
import { TutorsPage } from "../pages/tutors/tutors";
import { StudentProfilePage } from "../pages/student-profile/student-profile";
import { AddTutorPage } from "../pages/add-tutor/add-tutor";
import { StudentCalendarPage } from "../pages/student-calendar/student-calendar";
import { CalendarModule } from "ion2-calendar";
import { NgCalendarModule } from "ionic2-calendar";
import { registerLocaleData } from "@angular/common";
import localeEn from "@angular/common/locales/en-GB";
import { TimelinePage } from "../pages/timeline/timeline";
import { DayPage } from "../pages/day/day";
import { AddEventPage } from "../pages/add-event/add-event";
import { BranchesPage } from "../pages/branches/branches";
import { IonicStorageModule } from "@ionic/storage";
import { SettingsPage } from "../pages/settings/settings";
import { TutorProfilePage } from "../pages/tutor-profile/tutor-profile";
import { SessionsHistoryPage } from "../pages/sessions-history/sessions-history";
import { DatePicker } from "@ionic-native/date-picker";
import { DatePickerModule } from "ion-datepicker";
import { EditSessionPage } from "../pages/edit-session/edit-session";
import { UsersPickerPage } from "../pages/users-picker/users-picker";
import { AddSessionPage } from "../pages/add-session/add-session";
import { NotificationsPage } from "../pages/notifications/notifications";
import { FCM } from "@ionic-native/fcm";
import { RecommendationPage } from "../pages/recommendation/recommendation";
import localeFr from "@angular/common/locales/fr-CF";
import localeFrCA from "@angular/common/locales/fr-CA";

import {
  HttpClient,
  HttpClientModule,
  HTTP_INTERCEPTORS
} from "@angular/common/http";
import {
  TranslateService,
  TranslateModule,
  TranslateLoader
} from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "assets/i18n/", ".json");
}
registerLocaleData(localeFr, "fr-CF");
registerLocaleData(localeEn, "en-GB");
registerLocaleData(localeFrCA, "fr-CA");


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    RegisterPage,
    LoginPage,
    OnboardingPage,
    UsersPage,
    AddStudentPage,
    TutorsPage,
    StudentProfilePage,
    AddTutorPage,
    StudentCalendarPage,
    TimelinePage,
    DayPage,
    AddEventPage,
    BranchesPage,
    SettingsPage,
    TutorProfilePage,
    SessionsHistoryPage,
    EditSessionPage,
    UsersPickerPage,
    AddSessionPage,
    NotificationsPage,
    RecommendationPage
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    IonicModule.forRoot(MyApp),
    LottieAnimationViewModule.forRoot(),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireAuthModule,
    CalendarModule,
    CacheModule.forRoot(),
    NgCalendarModule,
    IonicStorageModule.forRoot(),
    DatePickerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    SettingsPage,
    MyApp,
    HomePage,
    RegisterPage,
    LoginPage,
    OnboardingPage,
    UsersPage,
    AddStudentPage,
    TutorsPage,
    StudentProfilePage,
    AddTutorPage,
    StudentCalendarPage,
    TimelinePage,
    DayPage,
    AddEventPage,
    BranchesPage,
    TutorProfilePage,
    SessionsHistoryPage,
    EditSessionPage,
    UsersPickerPage,
    AddSessionPage,
    NotificationsPage,
    RecommendationPage
  ],
  providers: [
    StorageService,
    NativePageTransitions,
    StatusBar,
    SplashScreen,
    ApiService,
    NavService,
    CookieService,
    DatePicker,
    FCM,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    { provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true },
    { provide: LOCALE_ID, useValue: "en-GB" }
  ]
})
export class AppModule { }
