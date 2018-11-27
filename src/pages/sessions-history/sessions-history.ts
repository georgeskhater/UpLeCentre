import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Eval} from "../../model/eval";
import {User} from "../../model/user";
import * as firebase from "firebase";
import {UserSession} from "../../model/user-session";
import {UserEvent} from "../../model/user-event";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'page-sessions-history',
  templateUrl: 'sessions-history.html',
})
export class SessionsHistoryPage {
  public user: User;
  public userEval: Eval;
  public userSessions: UserSession[];
  private listener;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.user = this.navParams.get("user");
    this.userEval = this.navParams.get("userEval");
  }

  ionViewDidLoad() {
    this.listener = firebase.firestore()
      .collection("user-sessions")
      .where("userId", "==", this.user.id)
      .where("timestamp", "<=", new Date().getTime())
      .where("subject", "==", this.userEval.subject)
      .onSnapshot(snapshot => {
        this.userSessions = [];
        snapshot.forEach(document => {
          const userSession = new UserSession();
          for (let field in document.data()) {
            userSession[field] = document.data()[field];
          }
          if (userSession.eval > 0 && userSession.note) {
            this.userSessions.push(userSession);
          }
        });
        this.userSessions = this.userSessions.sort((a, b) => a.timestamp > b.timestamp ? -1 : 1);
        console.log(this.userSessions);
      })
  }

  ionViewDidLeave() {
    this.listener();
  }

  public getColor(session: UserSession): string {
    switch (session.category) {
      case UserEvent.CATEGORY_EXERCISE:
        return '#3fa36c';
      case UserEvent.CATEGORY_EXAM:
        return '#ff4353';
      case UserEvent.CATEGORY_CONTROL:
        return '#ff834c';
      default:
        return 'black';
    }
  }

  public getDate(timestamp): string {
    return new DatePipe("en").transform(new Date(timestamp), "mediumDate");
  }
}
