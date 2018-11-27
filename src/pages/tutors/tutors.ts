import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api-service";
import "rxjs/add/operator/debounce";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/distinctUntilChanged";
import {User} from "../../model/user";
import {StorageService, UserCacheListener} from "../../service/cache";
import {NavController} from "ionic-angular";
import {NativePageTransitions, NativeTransitionOptions} from "@ionic-native/native-page-transitions";
import {AddStudentPage} from "../add-student/add-student";
import {NavService} from "../../service/nav-service";
import {AddTutorPage} from "../add-tutor/add-tutor";
import {StudentProfilePage} from "../student-profile/student-profile";
import {TutorProfilePage} from "../tutor-profile/tutor-profile";

@Component({
  selector: 'page-tutors',
  templateUrl: 'tutors.html',
})
export class TutorsPage implements OnInit, UserCacheListener {
  public lottieConfig;
  public users: User[] = [];
  public recentUsers: User[] = [];
  public loading = false;
  public user: User = new User();

  constructor(private apiService: ApiService,
              private cache: StorageService,
              public navCtrl: NavController,
              private nativePageTransitions: NativePageTransitions,
              private navService: NavService) {
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

  ionViewDidEnter(){
    this.getRecentUsers();
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
    this.apiService.searchTutors(value)
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
      this.cache.put(StorageService.RECENT_TUTORS_KEY, this.recentUsers);
    }
    this.openUserProfile(user);
  }

  private getRecentUsers() {
    this.cache.get(StorageService.RECENT_TUTORS_KEY).then(recentUsers => {
      this.recentUsers = recentUsers;
    }).catch(error => {
      console.log(error);
    })
  }

  public openUserProfile(user: User) {
    console.log(user);
    let options: NativeTransitionOptions = {
      duration: 300,
      iosdelay: 0,
      androiddelay: 0
    };
    const userCallback = (user: User) => {
      return new Promise((resolve) => {
        if (this.recentUsers) {
          for (let i = 0; i < this.recentUsers.length; i++) {
            if (this.recentUsers[i].id === user.id) {
              this.recentUsers[i] = user;
            }
          }
        }
        if (this.users) {
          for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === user.id) {
              this.users[i] = user;
            }
          }
        }
        console.log('user updated');
        this.cache.put(StorageService.RECENT_TUTORS_KEY, this.recentUsers);
        resolve();
      });
    };
    let params = {
      user: user,
      callback: userCallback
    };
    this.navService.openPageParams(TutorProfilePage, options, params);
  }

  public openAddUserPage() {
    let options: NativeTransitionOptions = {
      duration: 300,
      iosdelay: 0,
      androiddelay: 0
    };
    this.navService.openPage(AddTutorPage, options);
  }
}
