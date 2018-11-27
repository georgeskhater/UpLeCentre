import { Component } from "@angular/core";
import {
  AlertController,
  IonicPage,
  Loading,
  LoadingController,
  NavController,
  NavParams,
  ToastController
} from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { User } from "../../model/user";
import { ApiService } from "../../service/api-service";
import { SUBJECTS } from "../../model/subjects";
import { Eval } from "../../model/eval";
import { EVALS } from "../../model/evals";
import { StorageService } from "../../service/cache";
import { SCHOOLS } from "../../model/schools";
@Component({
  selector: "page-add-student",
  templateUrl: "add-student.html"
})
export class AddStudentPage {
  public student = new User();
  private loader: Loading;
  public schools = SCHOOLS;
  public objectKeys = Object.keys;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private statusBar: StatusBar,
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private storageService: StorageService
  ) {
    this.student.privilege = User.PRIVILEGE_STUDENT;
    this.student.eval = [];
  }

  ionViewDidLoad() {
    this.statusBar.styleLightContent();
    console.log("ionViewDidLoad AddStudentPage");
  }

  public addStudent() {
    if (!this.checkFields()) {
      this.toastCtrl
        .create({
          message: "Fill all fields and at least one eval",
          duration: 2000
        })
        .present();
      return;
    }
    this.loader = this.loadingCtrl.create({ content: "Adding student" });
    this.loader.present();
    this.student.branch = this.storageService.getCachedBranch();
    this.apiService
      .addStudent(this.student)
      .then(() => {
        this.loader.dismissAll();
        this.toastCtrl
          .create({ message: "Successfully added student", duration: 2000 })
          .present();
        this.clearFields();
      })
      .catch(() => {
        this.loader.dismissAll();
        this.toastCtrl
          .create({ message: "Failed to add student", duration: 2000 })
          .present();
      });
  }

  private checkFields(): boolean {
    return (
      this.student.firstName &&
      this.student.lastName &&
      this.student.motherName &&
      this.student.fatherName &&
      this.student.address &&
      this.student.eval !== [] &&
      this.student.gradeAverage !== null &&
      this.student.phoneNumber !== null &&
      this.student.school &&
      this.student.description &&
      this.student.contactEmail &&
      this.student.enrollDate !== ""
    );
  }

  private clearFields() {
    this.student.firstName = "";
    this.student.lastName = "";
    this.student.motherName = "";
    this.student.fatherName = "";
    this.student.address = "";
    this.student.eval = [];
    this.student.gradeAverage = null;
    this.student.phoneNumber = null;
    this.student.school = "";
    this.student.contactEmail = "";
    this.student.description = "";
    this.student.enrollDate = "";
  }

  public addEval() {
    let inputEval = new Eval();
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
        inputEval.subject = subject;
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
            inputEval.eval = selectedEval;
            let alreadyExists = false;
            this.student.eval.forEach(cEval => {
              if (cEval.subject === inputEval.subject) {
                cEval.eval = inputEval.eval;
                alreadyExists = true;
              }
            });
            if (!alreadyExists) {
              this.student.eval.push(inputEval);
            }
          }
        });
        alert.present();
      }
    });
    alert.present();
  }

  public removeEval(inputEval: Eval) {
    this.student.eval.splice(this.student.eval.indexOf(inputEval, 0), 1);
  }
}
