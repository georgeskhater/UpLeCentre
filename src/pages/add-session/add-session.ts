import { Component } from "@angular/core";
import {
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import { DatePipe } from "@angular/common";
import { UserEvent } from "../../model/user-event";
import { UsersPickerPage } from "../users-picker/users-picker";
import * as firebase from "firebase";
import { UserSession } from "../../model/user-session";
import { StorageService } from "../../service/cache";
import { TranslateService } from "../../../node_modules/@ngx-translate/core";

@Component({
  selector: "page-add-session",
  templateUrl: "add-session.html"
})
export class AddSessionPage {
  public date: Date;
  public subject: string;
  public user;
  public events = [];
  public selectedEvent;
  public branch: string;
  public nouser: string;
  public local: string
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private storageService: StorageService,
    private loadingCtrl: LoadingController,
    public translate: TranslateService
  ) {
    this.date = this.navParams.get("date");
    this.subject = this.navParams.get("subject");
    this.branch = this.storageService.getCachedBranch();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad AddSessionPage");
  }
  ionViewDidEnter() {
    if (this.translate.currentLang.toUpperCase() == "EN") {
      this.local = "en-GB";
    }
    else {
      this.local = "fr-CF"
    }
  }

  public getDate() {
    if (this.date) {
      if (this.translate.currentLang.toUpperCase() == "EN")
        return new DatePipe("en").transform(this.date, "mediumDate");
      else
        return new DatePipe("fr-CF").transform(this.date, "mediumDate");
    } else {
      return "";
    }
  }

  public getUser() {
    if (this.user) {
      return this.user.firstName + " " + this.user.lastName;
    } else {
      return this.translate.instant("NO USER SELECTED");
    }
  }

  addSession() {
    if (this.selectedEvent) {
      const loadingRef = this.loadingCtrl.create({ content: "Please wait" });
      const userSession = new UserSession();
      userSession.eventId = this.selectedEvent.id;
      userSession.category = this.selectedEvent.category;
      userSession.studentName = this.user.firstName + " " + this.user.lastName;
      userSession.objective = this.selectedEvent.objective;
      userSession.timestamp = this.date.getTime();
      userSession.subject = this.selectedEvent.subject;
      userSession.userId = this.user.id;
      userSession.branch = this.branch;
      userSession.eventTimestamp = this.selectedEvent.timestamp;
      console.log("Adding session", userSession);
      firebase
        .firestore()
        .collection("user-sessions")
        .add(Object.assign({}, userSession))
        .then(() => {
          loadingRef.dismissAll();
          this.navCtrl.pop();
        })
        .catch(error => {
          loadingRef.dismissAll();
          this.toastCtrl
            .create({ message: "Failed to add session", duration: 1000 })
            .present();
        });
    } else {
      this.toastCtrl
        .create({ message: "Select an event first", duration: 1000 })
        .present();
    }
  }

  selectUser() {
    const modalref = this.modalCtrl.create(UsersPickerPage);
    modalref.onDidDismiss(user => {
      if (user) {
        this.user = user;
        this.events = [];
        firebase
          .firestore()
          .collection("user-events")
          .where("userId", "==", user.id)
          .where("branch", "==", this.branch)
          .where("subject", "==", this.subject)
          .where("timestamp", ">", this.date.getTime())
          .get()
          .then(snapShot => {
            snapShot.forEach(document => {
              const event = document.data();
              event.id = document.id;
              this.events.push(event);
            });
          })
          .catch(error => {
            console.log(error);
          });
      }
    });
    modalref.present();
  }

  public getColor(event: UserEvent): string {
    switch (event.category) {
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

  selectEvent() {
    if (this.user) {
    } else {
      this.toastCtrl
        .create({ message: "Select a user first", duration: 1000 })
        .present();
    }
  }
}
