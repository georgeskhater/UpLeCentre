import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {LoginPage} from "../login/login";
import {StatusBar} from "@ionic-native/status-bar";
import {NativePageTransitions, NativeTransitionOptions} from "@ionic-native/native-page-transitions";
import {RegisterPage} from "../register/register";

@Component({
  selector: 'page-onboarding',
  templateUrl: 'onboarding.html',
})
export class OnboardingPage implements OnInit {

  public lottieConfig: Object;

  ngOnInit(): void {
  }

  constructor(public navCtrl: NavController,
              private nativePageTransitions: NativePageTransitions,
              private statusBar: StatusBar) {
    this.configureLottie();
  }

  private configureLottie() {
    this.lottieConfig = {
      path: 'assets/json/phonological.json',
      autoplay: true,
      loop: true
    };
  }

  public openRegisterPage() {
    let options: NativeTransitionOptions = {
      duration: 300,
      iosdelay: 0,
      androiddelay: 0,
    };

    this.nativePageTransitions.fade(options);
    this.navCtrl.push(RegisterPage);
  }

  public openLoginPage() {
    let options: NativeTransitionOptions = {
      duration: 300,
      iosdelay: 0,
      androiddelay: 0,
    };

    this.nativePageTransitions.fade(options);
    this.navCtrl.push(LoginPage);
  }

}
