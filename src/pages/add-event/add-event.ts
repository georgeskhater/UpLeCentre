import { Component, Renderer } from "@angular/core";
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ToastController,
  ViewController
} from "ionic-angular";
import { UserEvent } from "../../model/user-event";
import { Storage } from "@ionic/storage";
import { User } from "../../model/user";
import { SUBJECTS } from "../../model/subjects";
import * as firebase from "firebase";
import { StorageService } from "../../service/cache";
import { UserSession } from "../../model/user-session";
import { DatePipe } from "@angular/common";
import { ApiService } from "../../service/api-service";
import { TranslateService } from "../../../node_modules/@ngx-translate/core";

@Component({
  selector: "page-add-event",
  templateUrl: "add-event.html"
})
export class AddEventPage {
  public date = new Date();
  public userEvent = new UserEvent();
  public user: User;
  public subject = "";
  public objective = "";
  public updating = false;
  public branch: string;
  public sessions = [];
  public subjects = SUBJECTS;
  public curUser: User = new User();
  public local: string;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private storageService: StorageService,
    private apiService: ApiService,
    private loadingCtrl: LoadingController,
    public translate: TranslateService
  ) {
    this.userEvent = new UserEvent();
    this.date = this.navParams.get("date");
    this.user = this.navParams.get("user");
    this.curUser = this.storageService.getCachedCredentials();
    this.branch = this.storageService.getCachedBranch();
    if (this.navParams.get("event")) {
      this.userEvent = this.navParams.get("event");
      this.updating = true;
    }
  }

  ionViewDidLoad() {
    this.userEvent.studentName = this.user.firstName + " " + this.user.lastName;
    this.userEvent.userId = this.user.id;
    this.userEvent.timestamp = this.date.getTime();
    if (this.updating) {
      this.getSessions();
    }
  }


  ionViewDidEnter() {
    if (!this.hasPrivilege()) {
      this.subjects = this.curUser.subject;
    }
    console.log(this.curUser);
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

  public getDate(timestamp) {
    if (timestamp) {
      return new DatePipe("en").transform(new Date(timestamp), "mediumDate");
    } else {
      return "";
    }
  }

  private getSessions() {
    firebase
      .firestore()
      .collection("user-sessions")
      .where("eventId", "==", this.userEvent.id)
      .where("branch", "==", this.branch)
      .get()
      .then(snapShot => {
        this.sessions = [];
        snapShot.forEach(document => {
          const session = new UserSession();
          session.id = document.id;
          for (let field in document.data()) {
            session[field] = document.data()[field];
          }
          this.sessions.push(session);
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  openSubjectPicker() {
    let alert = this.alertCtrl.create();
    alert.setTitle("Subject");
    SUBJECTS.forEach(subject => {
      alert.addInput({
        type: "radio",
        label: subject,
        value: subject
      });
    });

    alert.addButton("Cancel");
    alert.addButton({
      text: "OK",
      handler: subject => {
        this.userEvent.subject = subject;
      }
    });
    alert.present();
  }

  addEvent() {
    console.log(this.userEvent);
    this.userEvent.branch = this.branch;
    if (
      !this.userEvent ||
      !this.userEvent.subject ||
      !this.userEvent.objective ||
      !this.userEvent.category
    ) {
      this.toastCtrl
        .create({ message: "Please fill all fields", duration: 1000 })
        .present();
    } else {
      const loadingRef = this.loadingCtrl.create({ content: "Please wait" });
      loadingRef.present();
      if (this.userEvent.id) {
        firebase
          .firestore()
          .collection("user-events")
          .doc(this.userEvent.id)
          .set(Object.assign({}, this.userEvent), { merge: true })
          .then(() => {
            loadingRef.dismissAll();
            this.navCtrl.pop();
          })
          .catch(error => {
            loadingRef.dismissAll();
            this.toastCtrl
              .create({ message: "Failed to update event", duration: 1000 })
              .present();
          });
      } else {
        firebase
          .firestore()
          .collection("user-events")
          .add(Object.assign({}, this.userEvent))
          .then(documentRef => {
            documentRef
              .get()
              .then(document => {
                this.userEvent.id = document.id;
                this.apiService
                  .addEvent(
                    this.user.id,
                    this.user.firstName + " " + this.user.lastName,
                    this.branch,
                    this.userEvent
                  )
                  .then(() => {
                    loadingRef.dismissAll();
                    this.navCtrl.pop();
                  })
                  .catch(error => {
                    console.log(error);
                    loadingRef.dismissAll();
                    this.navCtrl.pop();
                  });
              })
              .catch(error => {
                loadingRef.dismissAll();
                console.log(error);
                this.navCtrl.pop();
              });
          })
          .catch(error => {
            loadingRef.dismissAll();
            this.toastCtrl
              .create({ message: "Failed to add event", duration: 1000 })
              .present();
          });
      }
    }
  }

  deleteEvent() {
    let alertRef = this.alertCtrl.create({
      title: "Delete event",
      message: "Are you sure you want to delete this message"
    });
    alertRef.addButton({
      text: "YES",
      handler: () => {
        firebase
          .firestore()
          .collection("user-events")
          .doc(this.userEvent.id)
          .delete()
          .then(() => {
            this.navCtrl.pop();
          })
          .catch(error => {
            this.toastCtrl
              .create({ message: "Failed to update event", duration: 1000 })
              .present();
          });
      }
    });
    alertRef.addButton({
      text: "NO",
      handler: () => {
        //do nothing..
      }
    });
    alertRef.present();
  }
}
