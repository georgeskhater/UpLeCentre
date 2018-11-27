import { Component } from '@angular/core';
import { IonicPage, LoadingController, NavController, NavParams, ToastController } from 'ionic-angular';
import { User } from '../../model/user';
import { UserEvent } from "../../model/user-event";
import { DatePipe } from '@angular/common';
import * as firebase from "firebase";
import { ApiService } from "../../service/api-service";
import { UserSession } from "../../model/user-session";
import { StorageService } from "../../service/cache";

@Component({
  selector: 'page-recommendation',
  templateUrl: 'recommendation.html',
})
export class RecommendationPage {
  public suggestedEvent: any;
  public allEvents: any[];
  public userId: string;
  public userName: string;
  public branch: string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private loadingCtrl: LoadingController, private apiService: ApiService,
    private toastCtrl: ToastController, private storageService: StorageService) {
    this.userId = this.navParams.get("userId");
    this.userName = this.navParams.get("userName");
    this.branch = this.storageService.getCachedBranch();
  }

  ionViewDidLoad() {
    this.getSuggested();
    this.loadAllEvents();
  }

  private getSuggested() {
    const loadingRef = this.loadingCtrl.create({ content: "Please wait" });
    loadingRef.present();
    this.apiService.getSuggested(this.userId)
      .then(event => {
        loadingRef.dismissAll();
        if (event) {
          this.suggestedEvent = event;
        }
      })
      .catch(error => {
        loadingRef.dismissAll();
        alert(JSON.stringify(error));
      })
  }

  private loadAllEvents() {
    const dateMorning = new Date();
    dateMorning.setHours(0, 0, 0);
    const morningTimestamp = dateMorning.getTime();
    this.apiService.getAllEvents(this.userId)
      .then(events => {
        if (events) {
          this.allEvents = events;
        }
      })
      .catch(error => {
        console.log(error);
      })
  }

  public getColor(event: UserEvent): string {
    if (event) {
      switch (event.category) {
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
  }

  public getDate(timestamp): string {
    return new DatePipe("en").transform(new Date(timestamp), "mediumDate");
  }

  addSession(event) {
    if (event) {
      const date = new Date();
      const loadingRef = this.loadingCtrl.create({ content: "Please wait" });
      const userSession = new UserSession();
      userSession.eventId = event.id;
      userSession.category = event.category;
      userSession.studentName = this.userName
      userSession.objective = event.objective;
      userSession.timestamp = date.getTime();
      userSession.subject = event.subject;
      userSession.userId = this.userId;
      userSession.branch = this.branch;
      userSession.eventTimestamp = event.timestamp;
      console.log("Adding session", userSession);
      firebase.firestore().collection("user-sessions")
        .add(Object.assign({}, userSession))
        .then(() => {
          loadingRef.dismissAll();
          this.navCtrl.pop();
        })
        .catch(error => {
          loadingRef.dismissAll();
          this.toastCtrl.create({ message: "Failed to add session", duration: 1000 }).present();
        })
    } else {
      this.toastCtrl.create({ message: "Select an event first", duration: 1000 }).present();
    }
  }
}
