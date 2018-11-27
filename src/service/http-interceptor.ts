import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {StorageService} from "./cache";

@Injectable()
export class Interceptor implements HttpInterceptor {

  constructor(private cache: StorageService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const credentials = this.cache.getCredentials();
    const token = credentials && credentials.token ? credentials.token : '';
    request = request.clone({
      setHeaders: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      setParams: {
        'branchKey': this.cache.getCachedBranch()
      }
    });
    console.log(request);
    return next.handle(request);
  }

}
