import { Component, OnInit } from "@angular/core";
import { NavController } from "ionic-angular";
import { StorageService, UserCacheListener } from "../../service/cache";
import { UsersPage } from "../users/users";
import { NativePageTransitions } from "@ionic-native/native-page-transitions";
import { Controller, NavService } from "../../service/nav-service";
import { StatusBar } from "@ionic-native/status-bar";
import { User } from "../../model/user";
import { TutorsPage } from "../tutors/tutors";
import { TimelinePage } from "../timeline/timeline";
import { BranchesPage } from "../branches/branches";
import { SettingsPage } from "../settings/settings";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage implements OnInit, Controller, UserCacheListener {
  public studentsTab = UsersPage;
  public tutorsTab = TutorsPage;
  public settingTab = TutorsPage;
  public homeTab = TimelinePage;
  public branchesTab = BranchesPage;
  public settingsTab = SettingsPage;

  public user: User = new User();

  constructor(
    public navCtrl: NavController,
    private cache: StorageService,
    private nativePageTransitions: NativePageTransitions,
    private navService: NavService,
    private statusBar: StatusBar,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.cache.addUserCacheListener(this);
    this.statusBar.styleLightContent();
    this.user = this.cache.getCredentials();
    this.navService.setCotnroller(this);
  }

  ionViewDidLoad() {
    this.statusBar.styleLightContent();
  }

  openPage(page, options, params?) {
    this.navCtrl.push(page, params);
  }

  openPageParams(page, options, params) {
    this.navCtrl.push(page, params);
  }

  setRoot(root) {
    this.navCtrl.setRoot(root);
  }

  onUserUpdated(user: User) {
    this.user = user;
  }
}
