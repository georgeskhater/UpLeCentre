import { Component, ApplicationRef } from "@angular/core";
import {
  AlertController,
  IonicPage,
  NavController,
  NavParams
} from "ionic-angular";
import { StorageService } from "../../service/cache";
import * as firebase from "firebase";
import { OnboardingPage } from "../onboarding/onboarding";
import { NavService } from "../../service/nav-service";
import { NotificationsPage } from "../notifications/notifications";
import { User } from "../../model/user";
import { FCM } from "@ionic-native/fcm";
import { TranslateService } from "../../../node_modules/@ngx-translate/core";

/**
 * Generated class for the SettingsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-settings",
  templateUrl: "settings.html"
})
export class SettingsPage {
  public user: User;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storageService: StorageService,
    private navService: NavService,
    private alertCtrl: AlertController,
    private fcm: FCM,
    public translate: TranslateService,
    private applicationRef: ApplicationRef
  ) {
    this.user = this.storageService.getCachedCredentials();

  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SettingsPage");
  }
  ionViewDidEnter() {
    if (!this.user.lang) {
      this.user.lang = "en";
    }
    this.translate.use(this.user.lang.toLowerCase());
    this.refreshUser();
  }
  public refreshUser() {
    console.log(this.user);
    console.log(Object.assign({}, this.user));
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.id)
      .set(Object.assign({}, this.user), { merge: true })
      .then(() => {
        console.log("Successfully updated user");
        this.storageService.saveCredentials(this.user);
      })
      .catch(error => {
        console.log("Couldn't update user: ", error);
      });
  }
  logout() {
    this.fcm
      .unsubscribeFromTopic("adminNotifications")
      .then(() => {
        console.log("Unsubscribed from topic");
      })
      .catch(error => {
        console.log("Failed to unsubscribe from topic: " + error);
      });
    const alertRef = this.alertCtrl.create({
      title: "Logout",
      message: "Are you sure you want to logout?"
    });
    alertRef.addButton({
      text: "NO"
    });
    alertRef.addButton({
      text: "YES",
      handler: () => {
        this.storageService.clear();
        firebase.auth().signOut();
        this.navService.setRoot(OnboardingPage);
      }
    });
    alertRef.present();
  }
  public changeLanguage(translate) {
    console.log("Editing lang");
    let controller = this.alertCtrl.create({
      title: "Change Language",
      message: "Choose a new language",
      buttons: [
        {
          text: "Cancel"
        },
        {
          text: "Save",
          handler: data => {
            this.user.lang = data;
            console.log(this.user);
            this.refreshUser();
            translate.use(data);
          }
        }
      ]
    });

    controller.addInput({
      type: "radio",
      label: `FR`,
      value: `fr`
    });

    controller.addInput({
      type: "radio",
      label: `EN`,
      value: `en`
    });

    controller.present();
  }
  public openNotifications() {
    this.navCtrl.push(NotificationsPage);
  }
}
