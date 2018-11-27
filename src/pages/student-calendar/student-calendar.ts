import { Component, OnInit, ViewChild } from "@angular/core";
import { ModalController, NavController, NavParams } from "ionic-angular";
import localeEn from "@angular/common/locales/en-GB";
import { DatePipe, registerLocaleData } from "@angular/common";
import { User } from "../../model/user";
import { UserEvent } from "../../model/user-event";
import { AddEventPage } from "../add-event/add-event";
import * as firebase from "firebase";
import { CalendarComponent } from "ionic2-calendar/calendar";
import { StorageService } from "../../service/cache";
import { TranslateService } from "../../../node_modules/@ngx-translate/core";

registerLocaleData(localeEn);

@Component({
  selector: "page-student-calendar",
  templateUrl: "student-calendar.html"
})
export class StudentCalendarPage implements OnInit {
  public user: User;
  public calendarTitle: string;
  public userEvents: UserEvent[] = [];
  public selectedDate = new Date();
  public displayedDates: Date[] = [];
  public rows = [];
  public columns = [];
  public daysOfWeek = ["Sun", "Mon", "Tues", "Wed", "Thur", "Fri", "Sat"];
  public daysOfWeekFr = ["Dim", "Lundi", "Mardi", "Merc", "Jeudi", "Vend", "Sam"];

  public date = new Date();
  public branch: string;
  public summary: string;
  public local: string
  @ViewChild(CalendarComponent) uiCalendar: CalendarComponent;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private storageService: StorageService,
    public translate: TranslateService
  ) {
    this.user = this.navParams.get("user");
    this.branch = this.storageService.getCachedBranch();
    this.haveSummary();
  }

  ngOnInit() {
    for (let i = 0; i < 7; i++) {
      this.columns.push(i);
    }
    for (let i = 0; i < 6; i++) {
      this.rows.push(i);
    }
    this.loadDates();
  }
  ionViewDidEnter() {
    if (this.translate.currentLang.toUpperCase() == "EN") {
      this.local = "en-GB";
    }
    else {
      this.local = "fr-CF"
    }
  }
  haveSummary() {
    if (!this.user.summary) this.user.summary = [];
    let index = this.user.summary.findIndex(
      sum =>
        new Date(sum.timestamp).setHours(0, 0, 0, 0) ==
        this.selectedDate.setHours(0, 0, 0, 0)
    );
    if (index >= 0) {
      this.summary = this.user.summary[index].text;
      return true;
    } else {
      this.summary = "";
      return false;
    }
  }

  ionViewDidLoad() {
    firebase
      .firestore()
      .collection("user-events")
      .where("userId", "==", this.user.id)
      .where("branch", "==", this.branch)
      .onSnapshot(
        snapShot => {
          this.userEvents = [];
          snapShot.forEach(document => {
            let event = document.data();
            event.id = document.id;
            this.userEvents.push(event as UserEvent);
          });
          console.log(this.userEvents);
        },
        error => {
          console.log(error);
        }
      );
  }

  public onTitleChanged(title: string) {
    this.calendarTitle = title;
  }

  getDateEvents(selectedDate): UserEvent[] {
    let dateEvents = [];
    if (this.userEvents) {
      this.userEvents.forEach(userEvent => {
        const eventDate = new Date(userEvent.timestamp);
        if (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        ) {
          dateEvents.push(userEvent);
        }
      });
    }

    return dateEvents;
  }

  public getColor(event: UserEvent): string {
    switch (event.category) {
      case UserEvent.CATEGORY_EXERCISE:
        return "#3fa36c";
      case UserEvent.CATEGORY_EXAM:
        return "#ff4353";
      case UserEvent.CATEGORY_CONTROL:
        return "#ff834c";
      default:
        return "black";
    }
  }

  public getSlotColor(selectedDate: Date): string {
    if (selectedDate == null || selectedDate == undefined) {
      return "white";
    } else if (
      this.selectedDate.getDate() === selectedDate.getDate() &&
      this.selectedDate.getMonth() === selectedDate.getMonth() &&
      this.selectedDate.getFullYear() === selectedDate.getFullYear()
    ) {
      return "#32db64";
    } else {
      let lastEvent: UserEvent;
      this.userEvents
        .filter(userEvent => {
          const eventDate = new Date(userEvent.timestamp);
          return (
            eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear()
          );
        })
        .forEach(userEvent => {
          if (
            !lastEvent ||
            this.getPriority(userEvent) <= this.getPriority(lastEvent)
          ) {
            lastEvent = userEvent;
          }
        });
      if (lastEvent) {
        return this.getColor(lastEvent);
      } else {
        return "white";
      }
    }
  }

  public getPriority(event: UserEvent): number {
    switch (event.category) {
      case UserEvent.CATEGORY_EXAM:
        return 1;
      case UserEvent.CATEGORY_CONTROL:
        return 2;
      case UserEvent.CATEGORY_EXERCISE:
        return 3;
      default:
        return 4;
    }
  }

  public getTextColor(date: Date): string {
    if (date) {
      const events = this.userEvents.filter(userEvent => {
        const eventDate = new Date(userEvent.timestamp);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      });
      if (events && events.length > 0) {
        return "white";
      } else {
        return "black";
      }
    } else {
      return "black";
    }
  }

  goNext() {
    this.date.setMonth(this.date.getMonth() + 1);
    this.loadDates();
  }

  goBack() {
    this.date.setMonth(this.date.getMonth() - 1);
    this.loadDates();
  }

  addEvent(selectedDate) {
    let modal = this.navCtrl.push(AddEventPage, {
      date: this.selectedDate,
      user: this.user
    });
  }

  private loadDates() {
    this.displayedDates = [];
    const date = new Date(this.date.getTime());
    if (this.translate.currentLang.toUpperCase() == "EN") {
      this.calendarTitle = new DatePipe("en").transform(date, "MMMM yyyy");
    }
    else {
      this.calendarTitle = new DatePipe("fr-CF").transform(date, "MMMM yyyy");

    }
    date.setDate(date.getDate() - (date.getDate() - 1));
    const offset = date.getDay();
    const endOffset = offset + this.daysInMonth(date);
    console.log(offset, endOffset, this.daysInMonth(date));
    for (let i = 0; i < 42; i++) {
      const curDate = new Date(date.getTime());
      if (i >= offset && i < endOffset) {
        date.setDate(date.getDate() + 1);
        this.displayedDates.push(curDate);
      } else {
        this.displayedDates.push(null);
      }
    }
  }

  daysInMonth(date) {
    const returnDate = new Date(date.getTime());
    returnDate.setMonth(returnDate.getMonth() + 1);
    returnDate.setDate(0);
    return returnDate.getDate();
  }

  getDisplayDate(date: Date) {
    if (date != null && date != undefined) {
      return date.getDate();
    } else {
      return "";
    }
  }

  updateSelectedDate(date: Date) {
    if (date) {
      this.selectedDate = date;
    }
  }

  openEvent(event: UserEvent) {
    let modal = this.navCtrl.push(AddEventPage, {
      date: this.selectedDate,
      user: this.user,
      event: event
    });
  }
}
