import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, NavParams, ToastController } from 'ionic-angular';
import { User } from "../../model/user";
import { StorageService, UserCacheListener } from "../../service/cache";
import * as firebase from "firebase";
import 'firebase/firestore';
import { Eval } from "../../model/eval";
import { SUBJECTS } from "../../model/subjects";
import { EVALS } from "../../model/evals";
import { NativePageTransitions, NativeTransitionOptions } from "@ionic-native/native-page-transitions";
import { StudentCalendarPage } from "../student-calendar/student-calendar";

@Component({
  selector: 'page-tutor-profile',
  templateUrl: 'tutor-profile.html',
})
export class TutorProfilePage implements UserCacheListener, OnInit {
  public user: User = new User();
  public curUser: User = new User();
  private userCallback: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private cache: StorageService, private alertCtrl: AlertController,
    private nativePageTransitions: NativePageTransitions, private toastCtrl: ToastController) {
    this.user = navParams.get('user');
    this.userCallback = navParams.get('callback');
    this.curUser = this.cache.getCachedCredentials();
  }

  public hasPrivilege(): boolean {
    return this.curUser && this.curUser.privilege === User.PRIVILEGE_ADMIN;
  }

  ngOnInit() {
    firebase.firestore()
      .collection('users')
      .doc(this.user.id)
      .onSnapshot(document => {
        console.log('User changed: ', document.data());
        for (let field in document.data()) {
          this.user[field] = document.data()[field];
        }
        if (this.userCallback) {
          this.userCallback(this.user);
        }
      }, error => {
        console.log(error);
      })
  }

  onUserUpdated(user: User) {
    this.curUser = user;
  }

  editEval(userEval: Eval) {
    console.log('Editing eval');
    let controller = this.alertCtrl.create({
      title: 'Edit eval',
      message: 'Enter new value for ' + userEval.subject,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: data => {
            console.log(data);
            userEval.eval = data;
            this.refreshUser();
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

  public removeEval(userEval: Eval) {
    let confirm = this.alertCtrl.create({
      title: 'Delete ' + userEval.subject + '?',
      message: 'Are you sure you want to remove this evaluation from ' + this.user.firstName + '\'s profile?',
      buttons: [
        {
          text: 'No'
        },
        {
          text: 'Yes',
          handler: () => {
            this.user.eval = this.user.eval.filter(curEval => curEval.subject !== userEval.subject);
            this.refreshUser();
          }
        }
      ]
    });
    confirm.present();
  }

  public addEval() {
    let inputEval = {};
    let alert = this.alertCtrl.create();
    alert.setTitle('Subject');
    SUBJECTS.forEach(subject => {
      alert.addInput({
        type: 'radio',
        label: subject,
        value: subject
      });
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: subject => {
        inputEval['subject'] = subject;
        let alert = this.alertCtrl.create();
        alert.setTitle('Eval');
        Object.keys(EVALS).forEach((key) => {
          alert.addInput({
            type: 'radio',
            label: `${key} (${EVALS[key]})`,
            value: key
          });
        });
        alert.addButton('Cancel');
        alert.addButton({
          text: 'OK',
          handler: selectedEval => {
            inputEval['eval'] = selectedEval;
            let alreadyExists = false;
            this.user.eval.forEach(cEval => {
              if (cEval.subject === inputEval['subject']) {
                cEval.eval = inputEval['eval'];
                alreadyExists = true;
              }
            });
            if (!alreadyExists) {
              this.user.eval.push(inputEval as Eval);
            }
            this.refreshUser();
          }
        });
        alert.present();
      }
    });
    alert.present();
  }

  public refreshUser() {
    console.log(this.user);
    console.log(Object.assign({}, this.user));
    firebase.firestore().collection('users')
      .doc(this.user.id)
      .set(Object.assign({}, this.user), { merge: true })
      .then(() => {
        console.log('Successfully updated user');
      })
      .catch(error => {
        console.log('Couldn\'t update user: ', error);
      })
  }

  openSubjectPicker() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Subject');
    SUBJECTS.forEach(subject => {
      alert.addInput({
        type: 'checkbox',
        label: subject,
        value: subject
      });
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: subject => {
        this.user.subject = subject;
        if (this.user.subject.length > 0) {
          this.user.primarySubject = this.user.subject[0];
        }
        else {
          this.user.primarySubject = "";

        }
        this.refreshUser();
      }
    });
    alert.present();
  }

  openPrimarySubjectPicker() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Subject');
    this.user.subject.forEach(subject => {
      alert.addInput({
        type: 'radio',
        label: subject,
        value: subject
      });
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: subject => {
        this.user.primarySubject = subject;
        this.refreshUser();
      }
    });
    alert.present();
  }
  editInputStr(fieldName, curValue, type?) {
    let prompt = this.alertCtrl.create({
      title: 'Edit profile',
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
            this.user[fieldName] = data["value"];
            this.refreshUser();
          }
        }
      ]
    });
    prompt.present();
  }

  revokePermissions() {
    const alertRef = this.alertCtrl.create({
      title: "Revoke permissions",
      message: "Are you sure? This will immediately make the tutor unable to use the app and will log him/her out"
    });
    alertRef.addButton({
      text: "No"
    });
    alertRef.addButton({
      text: "Yes, I'm aware of my actions",
      handler: () => {
        this.user.revoked = true;
        this.refreshUser();
      }
    });
    alertRef.present();
  }

  reinstatePermissions() {
    const alertRef = this.alertCtrl.create({
      title: "Re-instate permissions",
      message: "Are you sure? This will make the tutor able to log in again."
    });
    alertRef.addButton({
      text: "No"
    });
    alertRef.addButton({
      text: "Yes, I'm aware of my actions",
      handler: () => {
        this.user.revoked = false;
        this.refreshUser();
      }
    });
    alertRef.present();
  }
}
