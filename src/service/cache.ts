import {Injectable} from "@angular/core";
import {CookieService} from "angular2-cookie/core";
import {User} from "../model/user";
import {Storage} from '@ionic/storage';
import {BranchesPage} from "../pages/branches/branches";

export interface UserCacheListener {
  onUserUpdated(user: User);
}

@Injectable()
export class StorageService {
  public static NOTIFICATIONS_KEY = "NOTIFICATIONS";
  public static CREDENTIALS_KEY = 'CREDENTIALS';
  public static RECENT_USERS_KEY = 'RECENT_USERS';
  public static RECENT_TUTORS_KEY = 'RECENT_TUTORS';
  public static BRANCH_KEY = "BRANCH_KEY";
  public static SESSIONS_KEY = "SESSIONS_KEY";

  private userCacheListeners: UserCacheListener[] = [];

  constructor(private cookieService: CookieService,
              private storage: Storage) {
  }

  public saveCredentials(user) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    this.cookieService.put(StorageService.CREDENTIALS_KEY, JSON.stringify(user), {expires: date});
    if (this.userCacheListeners) {
      this.userCacheListeners.forEach(listener => {
        listener.onUserUpdated(user);
      });
    }
  }

  public getCachedBranch(): string {
    const branchKey = this.cookieService.get(StorageService.BRANCH_KEY);
    if (branchKey) {
      return branchKey;
    } else {
      return "0";
    }
  }

  public setCachedBranch(key: string) {
    const date = new Date();

    console.log("New branch key: ", key);
    date.setFullYear(date.getFullYear() + 1);
    this.cookieService.put(StorageService.BRANCH_KEY, key, {expires: date});
  }

  public getCredentials(): User {
    return this.getCachedCredentials();
  }

  public getCachedCredentials(): User {
    const credentialsJson = this.cookieService.get(StorageService.CREDENTIALS_KEY);
    if (credentialsJson) {
      return JSON.parse(credentialsJson);
    } else {
      return undefined;
    }
  }

  public isLoggedIn(): boolean {
    const credentials = this.getCredentials();
    return credentials && credentials.token !== '';
  }

  public put(key, item) {
    this.storage.set(key, item).catch(error => {
      console.log(error);
    });
  }

  public get(key): any {
    return this.storage.get(key);
  }

  public addUserCacheListener(userCacheListener: UserCacheListener) {
    if (!this.userCacheListeners) {
      this.userCacheListeners = [];
    }
    this.userCacheListeners.push(userCacheListener);
  }

  clear() {
    this.cookieService.removeAll();
    this.storage.clear().catch(error => {
      console.log(error);
    });
  }
}
