export class UserEvent {
  public static CATEGORY_EXAM = "EXAM";
  public static CATEGORY_EXERCISE = "EXERCISE";
  public static CATEGORY_CONTROL = "CONTROL";


  id: string;
  subject: string;
  timestamp: number;
  category: string;
  userId: string;
  objective: string;
  studentName: string;

}
