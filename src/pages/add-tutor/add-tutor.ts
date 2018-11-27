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

@Component({
  selector: "page-add-tutor",
  templateUrl: "add-tutor.html"
})
export class AddTutorPage {
  public tutor = new User();
  private loader: Loading;
  public SUBJECTS = SUBJECTS;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private statusBar: StatusBar,
    private apiService: ApiService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private storageService: StorageService
  ) {}

  ionViewDidLoad() {
    this.tutor.privilege = User.PRIVILEGE_TUTOR;
    this.tutor.eval = [];
    this.tutor.subject = [];
    this.tutor.subject.push(this.SUBJECTS[0]);
  }

  public addStudent() {
    if (!this.checkFields()) {
      this.toastCtrl
        .create({ message: "Fill all fields", duration: 2000 })
        .present();
      return;
    }
    this.loader = this.loadingCtrl.create({ content: "Adding tutor" });
    this.loader.present();
    this.tutor.branch = this.storageService.getCachedBranch();
    this.apiService
      .addTutor(this.tutor)
      .then(() => {
        this.loader.dismissAll();
        this.toastCtrl
          .create({ message: "Successfully added tutor", duration: 2000 })
          .present();
        this.clearFields();
      })
      .catch(() => {
        this.loader.dismissAll();
        this.toastCtrl
          .create({ message: "Failed to add tutor", duration: 2000 })
          .present();
      });
  }

  private checkFields(): boolean {
    return (
      this.tutor.firstName &&
      this.tutor.lastName &&
      this.tutor.phoneNumber &&
      this.tutor.address &&
      this.tutor.email &&
      this.tutor.subject.length > 0 &&
      this.tutor.enrollDate !== ""
    );
  }

  private clearFields() {
    this.tutor.firstName = "";
    this.tutor.lastName = "";
    this.tutor.motherName = "";
    this.tutor.fatherName = "";
    this.tutor.address = "";
    this.tutor.eval = [];
    this.tutor.gradeAverage = null;
    this.tutor.phoneNumber = null;
    this.tutor.school = "";
    this.tutor.email = "";
    this.tutor.description = "";
    this.tutor.subject.push(this.SUBJECTS[0]);
    this.tutor.enrollDate = "";
  }
}
