import {
  Component,
  OnInit,
  NgZone,
  PipeTransform,
  ApplicationRef
} from "@angular/core";
import { IonicPage, NavController, NavParams, Events } from "ionic-angular";
import * as firebase from "firebase";
import { NavService } from "../../service/nav-service";
import { DayPage } from "../day/day";
import { UsersPage } from "../users/users";
import { User } from "../../model/user";
import { StorageService } from "../../service/cache";
import { TranslateService } from "../../../node_modules/@ngx-translate/core";
import { registerLocaleData, DatePipe } from "@angular/common";
import localeFr from "@angular/common/locales/fr-CF";
@Component({
  selector: "page-timeline",
  templateUrl: "timeline.html"
})
export class TimelinePage {
  public userSessions = [];
  public days: Date[] = [];
  public user: User;
  public branch: string;
  public local: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private navService: NavService,
    private storageService: StorageService,
    public translate: TranslateService,
    public events: Events
  ) {
    this.user = this.storageService.getCredentials();
    this.branch = this.storageService.getCachedBranch();

  }

  ionViewDidEnter() {
    this.user = this.storageService.getCredentials();
    if (!this.user.lang) {
      this.user.lang = "en";
    }
    this.translate.use(this.user.lang.toLowerCase());
    this.branch = this.storageService.getCachedBranch();
    this.loadDays();
    this.getUserSessions();
    if (this.translate.currentLang.toUpperCase() == "EN") {
      this.local = "en-GB";
    }
    else {
      this.local = "fr-CF"
    }

  }

  getUserSessions() {
    this.storageService
      .get(StorageService.SESSIONS_KEY)
      .then(sessions => {
        if (sessions) {
          this.userSessions = sessions;
        }
      })
      .catch(error => {
        console.log(error);
      });
    firebase
      .firestore()
      .collection("user-sessions")
      .where("branch", "==", this.branch)
      .onSnapshot(querySnapshot => {
        let userSessions = [];
        querySnapshot.forEach(document => {
          const session = document.data();
          session.id = document.id;
          userSessions.push(session);
        });
        this.userSessions = userSessions;
        this.storageService.put(StorageService.SESSIONS_KEY, this.userSessions);
      });
  }

  private loadDays() {
    this.days = [];
    const date = new Date();
    date.setDate(date.getDate() + 20);
    for (let i = 0; i < 55; i++) {
      const newDate = new Date(date.getTime());
      this.days.push(newDate);
      date.setDate(date.getDate() - 1);
    }
  }

  public isToday(date) {
    const todayDate = new Date();
    return (
      todayDate.getDate() === date.getDate() &&
      todayDate.getFullYear() === date.getUTCFullYear() &&
      todayDate.getMonth() === date.getMonth()
    );
  }

  public getColor(date) {
    return this.isToday(date)
      ? "color($colors, primary)"
      : "color($colors, danger)";
  }

  openDay(date: Date) {
    let sessions = this.userSessions.filter(session => {
      const sessionDate = new Date(session.timestamp);

      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
    let navParams = {
      date: date,
      userSessions: sessions
    };
    this.navService.openPageParams(DayPage, { duration: 200 }, navParams);
  }
}
