import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { SUBJECTS } from "../../model/subjects";
import { UserSession } from "../../model/user-session";
import { UserEvent } from "../../model/user-event";
import { EditSessionPage } from "../edit-session/edit-session";
import { AddSessionPage } from "../add-session/add-session";
import * as firebase from "firebase";
import { StorageService } from "../../service/cache";
import { User } from "../../model/user";
import { TranslateService } from "../../../node_modules/@ngx-translate/core";

@Component({
  selector: "page-day",
  templateUrl: "day.html"
})
export class DayPage {
  public date = new Date();
  public userSessions = [];
  public subjects = SUBJECTS;
  public branch: string;
  public selectedSubject = this.subjects[0];
  public curUser: User = new User();
  public local: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storageService: StorageService,
    public translate: TranslateService
  ) {
    this.date = navParams.get("date");
    this.userSessions = navParams.get("userSessions");
    this.branch = this.storageService.getCachedBranch();
    this.curUser = this.storageService.getCachedCredentials();
    if (!this.hasPrivilege()) {
      this.subjects = this.curUser.subject;
    }
    console.log(this.curUser);
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad DayPage");
    this.getUserSessions();
  }
  ionViewDidEnter() {
    if (this.translate.currentLang.toUpperCase() == "EN") {
      this.local = "en-GB";
    }
    else {
      this.local = "fr-CF"
    }
  }
  hasPrivilege() {
    return this.curUser.privilege === "ADMIN";
  }

  getUserSessions() {
    firebase
      .firestore()
      .collection("user-sessions")
      .where("branch", "==", this.branch)
      .onSnapshot(querySnapshot => {
        this.userSessions = [];
        querySnapshot.forEach(document => {
          const session = document.data();
          session.id = document.id;
          const sessionDate = new Date(session.timestamp);
          if (
            sessionDate.getDate() === this.date.getDate() &&
            sessionDate.getMonth() === this.date.getMonth() &&
            sessionDate.getFullYear() === this.date.getFullYear()
          ) {
            this.userSessions.push(session);
          }
        });
        this.storageService.put(StorageService.SESSIONS_KEY, this.userSessions);
      });
  }

  getSessions(subject: string): any[] {
    return this.userSessions.filter(
      session =>
        session.subject === subject && (!session.note || session.eval === 0)
    );
  }

  public getColor(session: UserSession): string {
    switch (session.category) {
      case UserEvent.CATEGORY_EXERCISE:
        return "#3fa36c";
      case UserEvent.CATEGORY_EXAM:
        return "#ff4353";
      case UserEvent.CATEGORY_CONTROL:
        return "#ff834c";
      default:
        return "black";
    }
  }

  openSession(session) {
    const params = {
      session: session
    };
    this.navCtrl.push(EditSessionPage, params);
  }

  addsession(subject) {
    const params = {
      date: this.date,
      subject: subject
    };
    this.navCtrl.push(AddSessionPage, params);
  }

  public getCompleted(subject) {
    return this.userSessions.filter(
      session => session.subject === subject && session.note && session.eval > 0
    );
  }
}
