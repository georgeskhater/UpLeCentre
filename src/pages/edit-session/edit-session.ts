import {Component} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams, ToastController} from 'ionic-angular';
import {UserSession} from "../../model/user-session";
import {Eval} from "../../model/eval";
import {EVALS} from "../../model/evals";
import * as firebase from "firebase";
import {User} from "../../model/user";
import {StorageService} from "../../service/cache";
import {DatePipe} from "@angular/common";
import {RecommendationPage} from '../recommendation/recommendation';

/**
 * Generated class for the EditSessionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-edit-session',
  templateUrl: 'edit-session.html',
})
export class EditSessionPage {
  public session: UserSession;
  public curUser;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private alertCtrl: AlertController, private cache: StorageService,
              private toastCtrl: ToastController) {
    this.session = this.navParams.get("session");
    this.curUser = this.cache.getCachedCredentials();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditSessionPage');
  }

  public hasPrivilege(): boolean {
    return this.curUser && this.curUser.privilege === User.PRIVILEGE_ADMIN;
  }

  public getDate(timestamp) {
    if (timestamp) {
      return new DatePipe("en").transform(new Date(timestamp), "mediumDate");
    } else {
      return "";
    }
  }

  editEval() {
    console.log('Editing eval');
    let controller = this.alertCtrl.create({
      title: 'Edit eval',
      message: 'Enter new value',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            console.log(data);
            this.session.eval = data;
            this.refreshSession();
          },
        }]
    });
    Object.keys(EVALS).forEach((key) => {
      controller.addInput({
        type: 'radio',
        label: `${key} (${EVALS[key]})`,
        value: key
      });
    });
    controller.present();
  }

  editInputStr(fieldName, curValue, type?) {
    let prompt = this.alertCtrl.create({
      title: 'Write a note',
      inputs: [
        {
          name: 'value',
          placeholder: 'Enter new value',
          type: type ? type : "text",
          value: curValue
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
          }
        },
        {
          text: 'Save',
          handler: data => {
            console.log(data["value"]);
            this.session[fieldName] = data["value"];
            this.refreshSession();
          }
        }
      ]
    });
    prompt.present();
  }

  private refreshSession() {
    firebase.firestore().collection('user-sessions')
      .doc(this.session.id)
      .set(Object.assign({}, this.session), {merge: true})
      .then(() => {
        console.log('Successfully updated session');
      })
      .catch(error => {
        console.log('Couldn\'t update user: ', error);
      })

    if (this.session.eval && this.session.eval > 0 && this.session.note) {
      this.navCtrl.push(RecommendationPage, {userId: this.session.userId, userName: this.session.studentName});
    }
  }

  hasTutorPrivilege(subject) {
    return this.hasPrivilege() || (this.curUser.privilege === User.PRIVILEGE_TUTOR && this.curUser.subject === subject);
  }

  public deleteSession() {
    if (this.session) {
      const alertRef = this.alertCtrl.create({
        title: "Confirm deletion",
        message: "Are you sure you want to delete this session?"
      });
      alertRef.addButton({
        text: "Close"
      })
      alertRef.addButton({
        text: "Delete",
        handler: () => {
          firebase.firestore().collection("user-sessions")
            .doc(this.session.id)
            .delete()
            .then(() => {
              this.navCtrl.pop();
            })
            .catch(() => {
              this.toastCtrl.create({message: "Failed to delete session", duration: 2000}).present();
            })
        }
      })
      alertRef.present();
    }
  }
}
