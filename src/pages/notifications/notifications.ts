import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import { Notification } from "../../model/notification";
import * as firebase from "firebase";
import { notifications } from "../../../functions/src";
import { DatePipe } from "@angular/common";
import { StorageService } from "../../service/cache";

@Component({
  selector: "page-notifications",
  templateUrl: "notifications.html"
})
export class NotificationsPage {
  public notifications: Notification[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private toastCtrl: ToastController,
    private storageService: StorageService
  ) {}

  ionViewDidLoad() {
    this.loadCached();
    this.loadNotifications();
  }

  private loadCached() {
    this.storageService
      .get(StorageService.NOTIFICATIONS_KEY)
      .then(notifications => {
        if (notifications) {
          this.notifications = notifications;
          console.log(notifications);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  private loadNotifications() {
    firebase
      .firestore()
      .collection("notifications")
      .limit(100)
      .orderBy("timestamp", "desc")
      .onSnapshot(
        snapShot => {
          this.notifications = [];
          snapShot.forEach(document => {
            const notification = new Notification();
            for (let field in document.data()) {
              notification[field] = document.data()[field];
            }
            this.notifications.push(notification);
          });
          this.storageService.put(
            StorageService.NOTIFICATIONS_KEY,
            this.notifications
          );
        },
        error => {
          console.log(error);
          const toastRef = this.toastCtrl.create({
            message: "Failed to load notifications",
            closeButtonText: "Reload",
            showCloseButton: true,
            duration: 2000
          });
          toastRef.onDidDismiss((data, role) => {
            if (role === "close") {
              this.loadNotifications();
            }
          });
          toastRef.present();
        }
      );
  }

  public getDate(timestamp): string {
    return new DatePipe("en").transform(new Date(timestamp), "mediumDate");
  }

  public getMonth(timestamp) {
    const date = new Date(timestamp);
    return date.getMonth();
  }
}
