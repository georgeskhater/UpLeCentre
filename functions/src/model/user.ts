import {Eval} from "./eval";

export class User {
  public static PRIVILEGE_STUDENT = 'STUDENT';
  public static PRIVILEGE_TUTOR = 'TUTOR';
  public static PRIVILEGE_ADMIN = 'ADMIN';

  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  enrollDate: string;
  address: string;
  motherName: string;
  fatherName: string;
  description: string;
  eval: Eval[];
  school: string;
  gradeAverage: number;
  privilege: string;
  token: string;
  subject: string;
}
