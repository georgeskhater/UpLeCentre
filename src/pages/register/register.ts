import { Component, HostListener, OnInit, ViewChild } from "@angular/core";
import { NavController, ToastController } from "ionic-angular";
import { ApiService } from "../../service/api-service";
import { StorageService } from "../../service/cache";
import { HomePage } from "../home/home";
import {
  NativePageTransitions,
  NativeTransitionOptions
} from "@ionic-native/native-page-transitions";
import * as firebase from "firebase";
import { User } from "../../model/user";
import { FCM } from "@ionic-native/fcm";

@Component({
  selector: "page-register",
  templateUrl: "register.html"
})
export class RegisterPage implements OnInit {
  public loading = false;
  private inputs: any[];
  public focusedFieldIndex = 0;
  public lottieConfig: any;

  @ViewChild("fName")
  private fNameIn;
  @ViewChild("lName")
  private lNameIn;
  @ViewChild("email")
  private emailIn;
  @ViewChild("password")
  private passwordIn;

  @HostListener("keyup", ["$event"])
  enterPress(event) {
    if (event.code === "Enter") {
      this.focusNextField();
    }
  }

  constructor(
    public navCtrl: NavController,
    private toast: ToastController,
    private apiService: ApiService,
    private nativePageTransitions: NativePageTransitions,
    private cache: StorageService,
    private fcm: FCM
  ) {}

  ngOnInit() {
    this.configureLottie();
    this.initInputs();
  }

  private configureLottie() {
    this.lottieConfig = {
      path: "assets/json/cycle_animation.json",
      autoplay: true,
      loop: true
    };
  }

  private initInputs() {
    this.inputs = [];
    this.inputs.push(this.fNameIn);
    this.inputs.push(this.lNameIn);
    this.inputs.push(this.emailIn);
    this.inputs.push(this.passwordIn);
  }

  private focusNextField() {
    this.focusedFieldIndex++;
    if (this.focusedFieldIndex < this.inputs.length) {
      this.inputs[this.focusedFieldIndex].setFocus();
    } else {
      this.register();
    }
  }

  public updateFocus(index: number) {
    this.focusedFieldIndex = index;
  }

  public register() {
    const fName = this.fNameIn.value;
    const lName = this.lNameIn.value;
    const email = this.emailIn.value;
    const password = this.passwordIn.value;
    if (fName && lName && email && password) {
      this.loading = true;
      this.apiService
        .register(email, password, fName, lName)
        .then(returnUser => {
          console.log("sucess");
          firebase
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(
              user => {
                console.log("UID", user["uid"]);
                firebase.auth().onAuthStateChanged(user => {
                  user
                    .getIdToken()
                    .then(token => {
                      console.log("UID", token);
                      this.loading = false;
                      returnUser.token = token;
                      this.cache.setCachedBranch(returnUser.branch);
                      this.cache.saveCredentials(returnUser);
                      if (returnUser.privilege === User.PRIVILEGE_ADMIN) {
                        this.fcm
                          .subscribeToTopic("adminNotifications")
                          .then(() => {
                            console.log("Subscribed to topic");
                          })
                          .catch(error => {
                            console.log(
                              "Failed to subscribe to topic: " + error
                            );
                          });
                      }
                      this.openHomePage();
                    })
                    .catch(error => {
                      console.log(error);
                      this.loading = false;
                      this.toast
                        .create({
                          message: "Failed to register" + JSON.stringify(error),
                          duration: 2000
                        })
                        .present();
                    });
                });
              },
              error => {
                console.log(error);
                this.loading = false;
                this.toast
                  .create({
                    message: "Failed to register" + JSON.stringify(error),
                    duration: 2000
                  })
                  .present();
              }
            )
            .catch(error => {
              console.log(error);
              this.loading = false;
              this.toast
                .create({
                  message: "Failed to register" + JSON.stringify(error),
                  duration: 2000
                })
                .present();
            });
        })
        .catch(error => {
          console.log(error);
          this.loading = false;
          this.toast
            .create({
              message:
                "Failed to register, please try again" + JSON.stringify(error),
              duration: 2000
            })
            .present();
        });
    } else {
      this.showInputToast();
    }
  }

  private showInputToast() {
    this.toast
      .create({ message: "Please fill all fields", duration: 2000 })
      .present();
  }

  private openHomePage() {
    let options: NativeTransitionOptions = {
      duration: 300,
      iosdelay: 0,
      androiddelay: 0
    };
    this.nativePageTransitions.fade(options);
    this.navCtrl.setRoot(HomePage);
  }
}
