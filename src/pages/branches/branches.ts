import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {CookieService} from "angular2-cookie/core";
import {StorageService} from "../../service/cache";
import * as firebase from "firebase";

@Component({
  selector: 'page-branches',
  templateUrl: 'branches.html',
})
export class BranchesPage {
  public branchKey;
  public user;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private cache: StorageService) {
    this.user = this.cache.getCachedCredentials();
  }


  ionViewDidEnter() {
    this.branchKey = this.cache.getCachedBranch();
    console.log("Branch key", this.branchKey);
  }

  updateBranch(branchKey: string) {
    this.cache.setCachedBranch(branchKey);
    this.branchKey = branchKey;
    this.cache.put(StorageService.RECENT_USERS_KEY, []);
    this.cache.put(StorageService.RECENT_TUTORS_KEY, []);
    firebase.firestore().collection("users")
      .doc(this.user.id)
      .set({branch: this.branchKey}, {merge: true})
      .then(() => {
        console.log("Branch changed");
      })
      .catch(error => {
        console.log(error);
      })
  }
}
