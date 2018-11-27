import { Eval } from "./eval";
import { Summary } from "./summary";

export class User {
  public static PRIVILEGE_STUDENT = "STUDENT";
  public static PRIVILEGE_TUTOR = "TUTOR";
  public static PRIVILEGE_ADMIN = "ADMIN";

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
  responsible: string;
  gradeAverage: number;
  privilege: string;
  token: string;
  contactEmail: string;
  branch: string;
  revoked: boolean;
  subject: string[];
  primarySubject: string;
  summary: Summary[];
  lang: string;
}
