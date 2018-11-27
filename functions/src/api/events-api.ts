import {UserEvent} from "../model/user-event";
import {UserSession} from "../model/user-session";
import {corsOptions} from "../index";

const cors = require("cors");
const express = require("express");
const admin = require("firebase-admin");

export const addEventApi = express();
addEventApi.use(cors(corsOptions));
addEventApi.post('*', (request, response) => {
  const event = request.body;
  const userId = request.query.userId;
  const name = request.query.name;
  const branch = request.query.branch;
  let user: any;

  const sessions = [];

  let sessionToDelete: any;

  const dateMorning = new Date();
  dateMorning.setHours(0, 0, 0);
  const dateEvening = new Date();
  dateEvening.setHours(23, 59, 0);

  const morningTimestamp = dateMorning.getTime();
  dateMorning.setHours(12);
  const addTimestamp = dateMorning.getTime();
  const eveningTimestamp = dateEvening.getTime();

  admin.firestore().collection("users")
    .doc(userId)
    .get()
    .then(document => {
      user = document.data();
      user.id = document.id;

      return admin.firestore().collection("user-sessions")
        .where("timestamp", ">=", morningTimestamp)
        .get();
    })
    .then(snapShot => {
      snapShot.forEach(document => {
        const session = document.data();
        session.id = document.id;
        sessions.push(session);
      });

      console.log("Sessions", sessions);
      const userTodaySessions = sessions.filter(session => {
        console.log(session.timestamp);
        console.log(morningTimestamp);
        console.log(eveningTimestamp);
        console.log(session.note);
        console.log(session.eval);
        return session.timestamp >= morningTimestamp && session.timestamp <= eveningTimestamp
          && session.userId === userId && (session.eval === 0 || !session.note || !session.eval)
      });

      let shouldAdd = false;
      console.log("user today sessions", userTodaySessions);
      if (userTodaySessions.length > 0) {
        const sessionToChange = userTodaySessions[0];
        if (event.category === UserEvent.CATEGORY_EXAM) {
          if (sessionToChange.category === UserEvent.CATEGORY_EXAM) {
            const userEventEval = user.eval.filter(userEval => userEval.subject === event.subject)[0];
            const userSessionEval = user.eval.filter(userEval => userEval.subject === sessionToChange.subject)[0];

            console.log("User event", userEventEval.eval);
            console.log("User session", userSessionEval.eval);

            if (userEventEval.eval > userSessionEval.eval) {
              sessionToDelete = sessionToChange;
            } else {
              shouldAdd = false;
            }
          } else {
            shouldAdd = true;
            sessionToDelete = sessionToChange;
          }
        } else {
          if (sessionToChange.category !== UserEvent.CATEGORY_EXAM) {
            const userEventEval = user.eval.filter(userEval => userEval.subject === event.subject)[0];
            const userSessionEval = user.eval.filter(userEval => userEval.subject === sessionToChange.subject)[0];

            console.log("User event", userEventEval.eval);
            console.log("User session", userSessionEval.eval);
            if (userEventEval.eval > userSessionEval.eval) {
              sessionToDelete = sessionToChange;
            } else {
              shouldAdd = true;
            }
          } else {
            shouldAdd = false;
          }
        }
      } else {
        shouldAdd = true;
      }

      const newSession = Helper.createFromEvent(event, userId, name, branch, addTimestamp);
      if (sessionToDelete) {
        admin.firestore().collection("user-sessions")
          .doc(sessionToDelete.id)
          .delete()
          .then(() => {

            return admin.firestore().collection("user-sessions")
              .add(Object.assign({}, newSession));
          })
          .then(() => {
            response.status(200).send(JSON.stringify("A session was changed"));
          })
          .catch(error => {
            console.log(error);
            response.status(500).send(JSON.stringify(error));
          });
      } else {
        if (shouldAdd) {
          admin.firestore().collection("user-sessions")
            .add(Object.assign({}, newSession))
            .then(() => {
              response.status(200).send(JSON.stringify("A session was changed"));
            })
            .catch(error => {
              console.log(error);
              response.status(500).send(JSON.stringify(error));
            });
        } else {
          response.status(200).send(JSON.stringify("Nothing changed"));
        }
      }

    })
    .catch(error => {
      console.log(error);
      response.status(500).send(JSON.stringify(error));
    })
});


export const recommendationApi = express();
recommendationApi.use(cors(corsOptions));
recommendationApi.get('*', (request, response) => {
  const userId = request.query.userId;
  const dateMorning = new Date();
  dateMorning.setHours(0, 0, 0);
  const morningTimestamp = dateMorning.getTime();
  const dateEvening = new Date();
  dateEvening.setHours(23, 59, 0);
  const eveningTimestamp = dateEvening.getTime();

  let sessions = [];
  let events = [];

  admin.firestore().collection("user-sessions")
    .where("timestamp", "<=", eveningTimestamp)
    .get()
    .then(snapShot => {
      snapShot.forEach(document => {
        const session = document.data();
        session.id = document.id;
        sessions.push(session);
      });

      return admin.firestore().collection("user-events")
        .where("userId", "==", userId)
        .where("timestamp", ">=", morningTimestamp)
        .get()
    })
    .then(snapShot => {
      snapShot.forEach(document => {
        const event = document.data();
        event.id = document.id;
        events.push(event);
      });

      events = events.filter(event => {
        if (event.category === UserEvent.CATEGORY_EXAM) {
          return false;
        }
        let found: boolean;
        sessions.forEach(session => {
          if (session.eventId === event.id) {
            found = true;
          }
        });
        return !found;
      });

      const todaySessions = sessions.filter(session => {
        return !session.note || session.eval === 0 || !session.eval;
      });

      let recommendedEvent: any = null;
      let numberActive = 100;
      events.forEach(event => {
        const subjectSessions = todaySessions.filter(session => session.subject === event.subject);
        if (subjectSessions.length < numberActive && subjectSessions.length < 5) {
          numberActive = subjectSessions.length;
          recommendedEvent = event;
        }
      });

      response.status(200).send(JSON.stringify(recommendedEvent));
    })
    .catch(error => {
      console.log(error);
      response.status(500).send(JSON.stringify(error));
    })
});

export class Helper {

  public static isTomorrow(date, tomorrowTimestamp) {
    const tomorrowDate = new Date(tomorrowTimestamp);
    date.setDate(date.getDate() + 1);
    return Helper.sameDate(date, tomorrowDate);
  }

  public static sameDate(a, b) {
    return a.getDate() === b.getDate()
      && a.getMonth() === b.getMonth()
      && a.getFullYear() === b.getFullYear();
  }

  public static createFromEvent(selectedEvent, userId, name, branch, timestamp): UserSession {
    const userSession = new UserSession();
    userSession.eventId = selectedEvent.id;
    userSession.category = selectedEvent.category;
    userSession.studentName = name;
    userSession.objective = selectedEvent.objective;
    userSession.timestamp = timestamp;
    userSession.subject = selectedEvent.subject;
    userSession.userId = userId;
    userSession.eval = 0;
    userSession.note = "";
    userSession.branch = branch;
    userSession.eventTimestamp = selectedEvent.timestamp;
    return userSession;
  }

  public static getPriority(category: string): number {
    switch (category) {
      case UserEvent.CATEGORY_EXAM:
        return 3;
      case UserEvent.CATEGORY_CONTROL:
        return 2;
      case UserEvent.CATEGORY_EXERCISE:
        return 1;
      default:
        return 1;
    }
  }
}

export const allEventsApi = express();
allEventsApi.use(cors(corsOptions));
allEventsApi.get('*', (request, response) => {
  const userId = request.query.userId;
  const dateMorning = new Date();
  dateMorning.setHours(0, 0, 0);
  const morningTimestamp = dateMorning.getTime();

  const dateEvening = new Date();
  dateEvening.setHours(23, 59, 0);
  const eveningTimestamp = dateEvening.getTime();

  let sessions = [];
  let events = [];

  admin.firestore().collection("user-sessions")
    .where("timestamp", "<=", eveningTimestamp)
    .get()
    .then(snapShot => {
      snapShot.forEach(document => {
        const session = document.data();
        session.id = document.id;
        sessions.push(session);
      });

      return admin.firestore().collection("user-events")
        .where("userId", "==", userId)
        .where("timestamp", ">=", morningTimestamp)
        .get()
    })
    .then(snapShot => {
      snapShot.forEach(document => {
        const event = document.data();
        event.id = document.id;
        events.push(event);
      });

      events = events.filter(event => {
        if (event.category === UserEvent.CATEGORY_EXAM) {
          return false;
        }
        let found: boolean;
        sessions.forEach(session => {
          if (session.eventId === event.id) {
            found = true;
          }
        });
        return !found;
      });

      response.status(200).send(JSON.stringify(events));
    })
    .catch(error => {
      console.log(error);
      response.status(500).send(JSON.stringify(error));
    })
});
