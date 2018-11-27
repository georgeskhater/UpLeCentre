import { Component, OnInit } from "@angular/core";
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import { User } from "../../model/user";
import { StorageService, UserCacheListener } from "../../service/cache";
import * as firebase from "firebase";
import "firebase/firestore";
import { Eval } from "../../model/eval";
import { SUBJECTS } from "../../model/subjects";
import { SCHOOLS } from "../../model/schools";
import { EVALS } from "../../model/evals";
import {
  NativePageTransitions,
  NativeTransitionOptions
} from "@ionic-native/native-page-transitions";
import { StudentCalendarPage } from "../student-calendar/student-calendar";
import { SessionsHistoryPage } from "../sessions-history/sessions-history";
import { DatePicker } from "@ionic-native/date-picker";
import { ApiService } from "../../service/api-service";
import { Summary } from "../../model/summary";

@Component({
  selector: "page-student-profile",
  templateUrl: "student-profile.html"
})
export class StudentProfilePage implements UserCacheListener, OnInit {
  public user: User = new User();
  public curUser: User = new User();
  private userCallback: any;
  public fromDate;
  public toDate;
  public summary: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private cache: StorageService,
    private alertCtrl: AlertController,
    private nativePageTransitions: NativePageTransitions,
    private toastCtrl: ToastController,
    private datePicker: DatePicker,
    private apiService: ApiService,
    private loadingCtrl: LoadingController
  ) {
    this.user = navParams.get("user");
    this.userCallback = navParams.get("callback");
    this.curUser = this.cache.getCachedCredentials();
    let today = new Date();
    if (this.user.summary) {
      let sum = this.user.summary.find(
        sum =>
          new Date(sum.timestamp).setHours(0, 0, 0, 0) ==
          today.setHours(0, 0, 0, 0)
      );
      if (sum) {
        this.summary = sum.text;
      }
      else {
        this.summary = "";
      }
    }
    else {
      this.summary = "";
    }
  }

  public hasPrivilege(): boolean {
    return this.curUser && this.curUser.privilege === User.PRIVILEGE_ADMIN;
  }

  ngOnInit() {
    firebase
      .firestore()
      .collection("users")
      .doc(this.user.id)
      .onSnapshot(
        document => {
          console.log("User changed: ", document.data());
          for (let field in document.data()) {
            this.user[field] = document.data()[field];
          }
          console.log(this.user);
          if (this.userCallback) {
            this.userCallback(this.user);
          }
        },
        error => {
          console.log(error);
        }
      );
  }

  onUserUpdated(user: User) {
    this.curUser = user;
  }
  editSchool(user: User) {
    console.log("Editing school");
    let controller = this.alertCtrl.create({
      title: "Edit school",
      message: "Enter new school for " + user.firstName,
      buttons: [
        {
          text: "Cancel"
        },
        {
          text: "Save",
          handler: data => {
            console.log(data);
            user.responsible = "";
            user.school = data;
            this.refreshUser();
          }
        }
      ]
    });
    Object.keys(SCHOOLS).forEach(key => {
      controller.addInput({
        type: "radio",
        label: `${key}`,
        value: key
      });
    });

    controller.present();
  }
  editResponsible(user: User) {
    console.log("Editing responsible");
    let controller = this.alertCtrl.create({
      title: "Edit responsible",
      message: "Enter new responsible for " + user.firstName,
      buttons: [
        {
          text: "Cancel"
        },
        {
          text: "Save",
          handler: data => {
            console.log(data);
            user.responsible = data;
            this.refreshUser();
          }
        }
      ]
    });
    SCHOOLS[user.school].forEach(responsible => {
      controller.addInput({
        type: "radio",
        label: `${responsible}`,
        value: responsible
      });
    });

    controller.present();
  }
  editEval(userEval: Eval) {
    console.log("Editing eval");
    let controller = this.alertCtrl.create({
      title: "Edit eval",
      message: "Enter new value for " + userEval.subject,
      buttons: [
        {
          text: "Cancel"
        },
        {
          text: "Save",
          handler: data => {
            console.log(data);
            userEval.eval = data;
            this.refreshUser();
          }
        }
      ]
    });
    Object.keys(EVALS).forEach(key => {
      controller.addInput({
        type: "radio",
        label: `${key} (${EVALS[key]})`,
        value: key
      });
    });
    controller.present();
  }
  editDescription(userEval: Eval) {
    console.log("Editing eval description");
    let controller = this.alertCtrl.create({
      title: "Edit Description",
      message: "Enter new description for " + userEval.subject,
      inputs: [
        {
          name: "description",
          placeholder: "Description",
          value: userEval.description
        }
      ],
      buttons: [
        {
          text: "Cancel"
        },
        {
          text: "Save",
          handler: data => {
            userEval.description = data.description;
            this.refreshUser();
          }
        }
      ]
    });

    controller.present();
  }
  public removeEval(userEval: Eval) {
    let confirm = this.alertCtrl.create({
      title: "Delete " + userEval.subject + "?",
      message:
        "Are you sure you want to remove this evaluation from " +
        this.user.firstName +
        "'s profile?",
      buttons: [
        {
          text: "No"
        },
        {
          text: "Yes",
          handler: () => {
            this.user.eval = this.user.eval.filter(
              curEval => curEval.subject !== userEval.subject
            );
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
        inputEval["subject"] = subject;
        let alert = this.alertCtrl.create();
        alert.setTitle("Eval");
        Object.keys(EVALS).forEach(key => {
          alert.addInput({
            type: "radio",
            label: `${key} (${EVALS[key]})`,
            value: key
          });
        });
        alert.addButton("Cancel");
        alert.addButton({
          text: "OK",
          handler: selectedEval => {
            inputEval["eval"] = selectedEval;
            let alert = this.alertCtrl.create({
              title: "Description",
              inputs: [
                {
                  name: "description",
                  placeholder: "Description"
                }
              ]
            });
            alert.addButton("Cancel");
            alert.addButton({
              text: "OK",
              handler: data => {
                inputEval["description"] = data.description;
                let alreadyExists = false;
                this.user.eval.forEach(cEval => {
                  if (cEval.subject === inputEval["subject"]) {
                    cEval.eval = inputEval["eval"];
                    cEval.description = inputEval["description"];
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
    });
    alert.present();
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
      })
      .catch(error => {
        console.log("Couldn't update user: ", error);
      });
  }

  public openStudentCalendar() {
    let options: NativeTransitionOptions = {
      duration: 300,
      iosdelay: 0,
      androiddelay: 0
    };
    let params = {
      user: this.user
    };
    // this.nativePageTransitions.slide(options);

    this.navCtrl.push(StudentCalendarPage, params);
  }

  editGrade() {
    let prompt = this.alertCtrl.create({
      title: "Edit profile",
      inputs: [
        {
          name: "value",
          placeholder: "Enter new value (Must be <= 100)",
          type: "number",
          value: this.user.gradeAverage + ""
        }
      ],
      buttons: [
        {
          text: "Cancel",
          handler: data => { }
        },
        {
          text: "Save",
          handler: data => {
            console.log(data["value"]);
            if (data["value"] > 100 || data["value"] < 0) {
              this.toastCtrl
                .create({
                  message: "Grade must be a number betwweeen 0 and 100",
                  duration: 2000
                })
                .present();
            } else {
              this.user.gradeAverage = data["value"];
              this.refreshUser();
            }
          }
        }
      ]
    });
    prompt.present();
  }

  editSummary(curValue) {
    let prompt = this.alertCtrl.create({
      title: "Edit summary",
      inputs: [
        {
          name: "value",
          placeholder: "Enter new summary",
          type: "text",
          value: curValue
        }
      ],
      buttons: [
        {
          text: "Cancel",
          handler: data => { }
        },
        {
          text: "Save",
          handler: data => {
            let newSum = {
              timestamp: new Date().getTime(),
              text: data["value"]
            };
            if (!this.user.summary) this.user.summary = [];
            let index = this.user.summary.findIndex(
              sum =>
                new Date(sum.timestamp).setHours(0, 0, 0, 0) ==
                new Date(newSum.timestamp).setHours(0, 0, 0, 0)
            );
            if (index >= 0) {
              this.user.summary[index].timestamp = newSum.timestamp;
              this.user.summary[index].text = newSum.text;
            } else {
              this.user.summary.push(newSum);
            }
            this.summary = newSum.text;
            this.refreshUser();
          }
        }
      ]
    });
    prompt.present();
  }
  editInputStr(fieldName, curValue, type?) {
    let prompt = this.alertCtrl.create({
      title: "Edit profile",
      inputs: [
        {
          name: "value",
          placeholder: "Enter new value",
          type: type ? type : "text",
          value: curValue
        }
      ],
      buttons: [
        {
          text: "Cancel",
          handler: data => { }
        },
        {
          text: "Save",
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

  hasTutorPrivilegeSubject(subject) {
    return (
      this.hasPrivilege() ||
      (this.curUser.privilege === User.PRIVILEGE_TUTOR &&
        this.curUser.subject.find(x => x === subject))
    );
  }

  openHistory(userEval: Eval) {
    const params = {
      user: this.user,
      userEval: userEval
    };
    this.navCtrl.push(SessionsHistoryPage, params);
  }

  public updateFromDate(value) {
    console.log(value);
    this.fromDate = new Date(value.year, value.month - 1, value.day);
  }

  public updateToDate(value) {
    console.log(value);
    this.toDate = new Date(value.year, value.month - 1, value.day);
  }

  sendReport() {
    if (this.fromDate && this.toDate) {
      console.log(this.fromDate, this.toDate);
      const loadingRef = this.loadingCtrl.create({ content: "Sending email" });
      loadingRef.present();
      this.apiService
        .sendEmail(
          this.user.contactEmail,
          this.fromDate.getTime(),
          this.toDate.getTime(),
          this.user.id
        )
        .then(() => {
          loadingRef.dismissAll();
          this.toastCtrl
            .create({ message: "Email Sent !", duration: 2000 })
            .present();
          console.log("Email sent");
        })
        .catch(error => {
          loadingRef.dismissAll();
          this.toastCtrl
            .create({
              message: "Failed to send email" + JSON.stringify(error),
              duration: 2000
            })
            .present();
          console.log(error);
        });
    } else {
      this.toastCtrl
        .create({ message: "Pick dates first", duration: 1000 })
        .present();
    }
  }
}
