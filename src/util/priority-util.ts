import {UserEvent} from "../model/user-event";

export class PriorityUtil {

  public static getPriority(event: UserEvent): number {
    switch (event.category) {
      case UserEvent.CATEGORY_EXAM:
        return 1;
      case UserEvent.CATEGORY_EXERCISE:
        return 2;
      case UserEvent.CATEGORY_CONTROL:
        return 3;
      default:
        return 4;
    }
  }
}
