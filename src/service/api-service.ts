import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';


@Injectable()
export class ApiService {
  baseUrl = 'https://us-central1-up-le-centre.cloudfunctions.net/';

  constructor(private http: HttpClient) {
  }

  private endpoint(link): string {
    return this.baseUrl + link + "/";
  }

  public register(email, password, firstName, lastName): Promise<any> {
    const params = new HttpParams()
      .set('email', email)
      .set('password', password)
      .set('firstName', firstName)
      .set('lastName', lastName);
    return this.http.post(this.endpoint('register'), null, {params: params}).toPromise();
  }

  public login(token: string): Promise<any> {
    const params = new HttpParams()
      .set('token', token);
    return this.http.post(this.endpoint('login'), null, {params: params}).toPromise();
  }

  public search(searchQuery): Promise<any> {
    const params = new HttpParams()
      .set('searchQuery', searchQuery);
    return this.http.get(this.endpoint('search/students'), {params: params}).toPromise();
  }

  public searchTutors(searchQuery): Promise<any> {
    const params = new HttpParams()
      .set('searchQuery', searchQuery);
    return this.http.get(this.endpoint('search/tutors'), {params: params}).toPromise();
  }

  public addStudent(student): Promise<any> {
    return this.http.post(this.endpoint('addStudent'), JSON.stringify(student)).toPromise();
  }

  public getProfile(): Promise<any> {
    return this.http.get(this.endpoint('profile')).toPromise();
  }

  public addTutor(tutor): Promise<any> {
    return this.http.post(this.endpoint('addTutor'), JSON.stringify(tutor)).toPromise();
  }

  public sendEmail(email, fromDate, toDate, userId) {
    const params = new HttpParams()
      .set("email", email)
      .set("fromDate", fromDate)
      .set("toDate", toDate)
      .set("userId", userId);
    return this.http.post(this.endpoint('email'), null, {params: params}).toPromise();
  }

  public addEvent(userId, name, branch, event): Promise<any> {
    const params = new HttpParams()
      .set("userId", userId)
      .set("name", name)
      .set("branch", branch);
    return this.http.post(this.endpoint("event"), JSON.stringify(event), {params: params}).toPromise();
  }

  public getSuggested(userId): Promise<any> {
    const params = new HttpParams()
      .set("userId", userId);
    return this.http.get(this.endpoint("recommend"), {params: params}).toPromise();
  }

  public getAllEvents(userId): Promise<any> {
    const params = new HttpParams()
      .set("userId", userId);
    return this.http.get(this.endpoint("events"), {params: params}).toPromise();
  }
}
