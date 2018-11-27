import {Injectable} from "@angular/core";

export interface Controller {
  openPage(page, options, params?);

  openPageParams(page, options, params);

  setRoot(root: any): void;
}

@Injectable()
export class NavService {
  private controller: Controller;

  public setCotnroller(controller: Controller) {
    this.controller = controller;
  }

  public openPage(page, options, params?) {
    this.controller.openPage(page, options, params);
  }

  public openPageParams(page, options, params) {
    this.controller.openPageParams(page, options, params);
  }

  setRoot(root) {
    this.controller.setRoot(root);
  }
}
