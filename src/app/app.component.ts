import { Component, HostListener, OnInit } from "@angular/core";
import { AlertController, Platform } from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { FCM } from "@ionic-native/fcm";
import { HomePage } from "../pages/home/home";
import { OnboardingPage } from "../pages/onboarding/onboarding";
import * as firebase from "firebase";
import { FIREBASE_CONFIG } from "./app.firebase.config";
import { ApiService } from "../service/api-service";
import { StorageService } from "../service/cache";
import { User } from "../model/user";
import { TranslateService } from "@ngx-translate/core";

@Component({
  templateUrl: "app.html"
})
export class MyApp implements OnInit {
  rootPage: any;
  public mobileView: boolean;

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this.adjustWidth(event.target.innerWidth);
  }

  private adjustWidth(width) {
    this.mobileView = width <= 600;
  }

  ngOnInit() {
    firebase.initializeApp(FIREBASE_CONFIG);
    this.adjustWidth(window.innerWidth);
    if (this.cache.isLoggedIn()) {
      firebase.auth().onAuthStateChanged(
        user => {
          user
            .getIdToken()
            .then(token => {
              const user = this.cache.getCachedCredentials();
              user.token = token;
              firebase
                .firestore()
                .collection("users")
                .doc(user.id)
                .onSnapshot(
                  snapshot => {
                    this.cache.setCachedBranch(snapshot.data()["branch"]);

                    if (snapshot.data()["revoked"] === true) {
                      this.cache.clear();
                      this.alertController
                        .create({
                          title: "Permission revoked",
                          message:
                            "Permission to view this content have been revoked",
                          enableBackdropDismiss: false
                        })
                        .present();
                    }
                  },
                  error => {
                    console.log(error);
                  }
                );
              this.cache.saveCredentials(user);
              this.apiService
                .getProfile()
                .then(user => {
                  this.cache.saveCredentials(user);
                })
                .catch(error => {
                  console.log("Error", error);
                });
            })
            .catch(error => {
              console.log(error);
            });
        },
        error => {
          console.log(error);
        }
      );
      this.rootPage = HomePage;
    } else {
      this.rootPage = OnboardingPage;
    }
    this.splashScreen.hide();
  }

  constructor(
    platform: Platform,
    statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private apiService: ApiService,
    private cache: StorageService,
    private fcm: FCM,
    private alertController: AlertController,
    public translate: TranslateService
  ) {

    platform.ready().then(() => {
      this._initTranslate();
      statusBar.backgroundColorByHexString("#3770a7");
      statusBar.styleLightContent();
      if (platform.is("android") || platform.is("ios")) {
        this.initializeFcm();
      }
    });
  }
  private _initTranslate() {
    // Set the default language for translation strings, and the current language.
    this.translate.setDefaultLang('en');
  }
  private initializeFcm() {
    const user = this.cache.getCachedCredentials();
    if (
      user !== undefined &&
      user != null &&
      user.privilege === User.PRIVILEGE_ADMIN
    ) {
      this.fcm
        .subscribeToTopic("adminNotifications")
        .then(() => {
          console.log("Subscribed to topic");
        })
        .catch(error => {
          console.log("Failed to subscribe to topic: " + error);
        });
    }

    this.fcm.getToken().then(token => {
      console.log("Getting token: " + token);
    });

    this.fcm.onNotification().subscribe(data => {
      if (data.wasTapped) {
        console.log("Received in background " + data);
      } else {
        console.log("Received in foreground " + JSON.stringify(data));
      }
    });

    this.fcm.onTokenRefresh().subscribe(token => {
      console.log("Token refreshed: " + token);
    });
  }
}
