import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api-service";
import "rxjs/add/operator/debounce";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import {User} from "../../model/user";
import {StorageService, UserCacheListener} from "../../service/cache";
import {NavController, ViewController} from "ionic-angular";
import {NativePageTransitions, NativeTransitionOptions} from "@ionic-native/native-page-transitions";
import {AddStudentPage} from "../add-student/add-student";
import {NavService} from "../../service/nav-service";
import {StudentProfilePage} from "../student-profile/student-profile";

@Component({
  selector: 'page-users-picker',
  templateUrl: 'users-picker.html',
})
export class UsersPickerPage implements OnInit, UserCacheListener {
  public lottieConfig;
  public users: User[] = [];
  public recentUsers: User[] = [];
  public loading = false;
  public user: User = new User();

  constructor(private apiService: ApiService,
              private cache: StorageService,
              public navCtrl: NavController,
              private nativePageTransitions: NativePageTransitions,
              private navService: NavService,
              private viewCtrl: ViewController) {
    this.user = new User();
  }

  onUserUpdated(user: User) {
    this.user = user;
  }

  ngOnInit() {
    this.configureLottie();
    this.getRecentUsers();
    this.user = this.cache.getCredentials();
    this.cache.addUserCacheListener(this);
    console.log('User: ', this.user);
  }

  private configureLottie() {
    this.lottieConfig = {
      path: 'assets/json/search-animation.json',
      autoplay: true,
      loop: true
    };
  }

  public search(value) {
    this.users = [];
    if (value === '') {
      return;
    }
    console.log(value);
    this.loading = true;
    this.apiService.search(value)
      .then(result => {
        this.loading = false;
        this.users = result;
      })
      .catch(error => {
        this.loading = false;
        console.log(error);
      })
  }

  public addToRecent(user) {
    this.openUserProfile(user);
    let alreadyExists = false;
    this.recentUsers = this.recentUsers ? this.recentUsers : [];
    this.recentUsers.forEach(recentUser => {
      if (recentUser.firstName === user.firstName
        && recentUser.lastName === user.lastName) {
        alreadyExists = true;
      }
    });
    if (!alreadyExists) {
      this.recentUsers.push(user);
      this.cache.put(StorageService.RECENT_USERS_KEY, this.recentUsers);
    }
  }

  private getRecentUsers() {
    this.recentUsers = [];
  }

  public openAddUserPage() {
    let options: NativeTransitionOptions = {
      duration: 300,
      iosdelay: 0,
      androiddelay: 0
    };
    this.navService.openPage(AddStudentPage, options);
  }

  ionViewDidEnter(){
    this.getRecentUsers();
  }

  public openUserProfile(user: User) {
    this.viewCtrl.dismiss(user);
  }
}
