"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("./model/event");
const admin = require("firebase-admin");
class EventsScheduler {
    static scheduleNextWeek() {
        return new Promise((resolve, reject) => {
            const dateNow = new Date();
            const dateThen = new Date();
            const dateThirtyDays = new Date();
            dateThirtyDays.setDate(dateThirtyDays.getDate() - 30);
            dateNow.setHours(0, 0);
            dateThen.setDate(dateThen.getDate() + 14);
            dateThen.setHours(23, 0);
            let userSessions = [];
            let events = [];
            admin.firestore()
                .collection("user-sessions")
                .where("timestamp", ">=", dateThirtyDays.getTime())
                .where("eval", ">=", 0)
                .then(snapShot => {
                snapShot.forEach(document => {
                    const userSession = document.data();
                    userSession.id = document.id;
                    userSessions.push(userSession);
                });
                return admin.firestore()
                    .collection("events")
                    .where("timestamp", ">=", dateNow.getTime())
                    .where("timestamp", "<=", dateThen.getTime())
                    .get();
            })
                .then(snapShot => {
                snapShot.forEach(document => {
                    const event = document.data();
                    event.id = document.id;
                    events.push(event);
                });
                let examEvents = [];
                let controlEvents = [];
                let exerciseEvents = [];
                events.forEach(event => {
                    switch (event.category) {
                        case event_1.UserEvent.CATEGORY_EXAM:
                            examEvents.push(event);
                            break;
                        case event_1.UserEvent.CATEGORY_CONTROL:
                            controlEvents.push(event);
                            break;
                        case event_1.UserEvent.CATEGORY_EXERCISE:
                            exerciseEvents.push(event);
                            break;
                    }
                });
                examEvents = examEvents.filter(event => userSessions.filter(userSession => userSession.eventId === event.id).length < 3);
                controlEvents = exerciseEvents.filter(event => userSessions.filter(userSession => userSession.eventId === event.id).length < 2);
                exerciseEvents = exerciseEvents.filter(event => userSessions.filter(userSession => userSession.eventId === event.id).length < 1);
                examEvents.forEach(examEvent => {
                    let nbSessions = 0;
                    let examDate = new Date(examEvent.timestamp);
                    if (examDate.getDay() === 1 && examDate.getDate()) {
                    }
                });
            });
        });
    }
    static hey() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(2);
        });
    }
    static scheduleEvents() {
        return new Promise((resolve, reject) => {
            this.clearSessions().then(() => {
                this.updateSessions().then(() => {
                    resolve();
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static clearSessions() {
        return new Promise((resolve, reject) => {
            admin.firestore()
                .collection("sessions")
                .get()
                .then(querySnapshot => {
                let sessions = [];
                querySnapshot.forEach(document => {
                    let session = document.data();
                    session.id = document.id;
                    sessions.push(session);
                });
                const lastThirtyDays = (new Date().getTime() - (30 * 24 * 60 * 60 * 1000)) / 1000;
                admin.firestore()
                    .collection("events")
                    .where("lastEval", ">=", 0)
                    .where("timestamp", ">=", lastThirtyDays)
                    .get()
                    .then(querySnapshot => {
                    let events = [];
                    querySnapshot.forEach(document => {
                        events.push(document.data());
                    });
                    events.forEach(event => {
                        sessions.forEach(session => {
                        });
                    });
                    let updatedSessions = 0;
                    sessions.forEach(session => {
                        admin.firestore().collection("sessions")
                            .doc(session.id)
                            .set(session, { merge: true })
                            .then(() => {
                            updatedSessions++;
                            if (updatedSessions === sessions.length) {
                                resolve();
                            }
                        }).catch(error => {
                            reject(error);
                        });
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static updateSessions() {
        return new Promise((resolve, reject) => {
            admin.collection("sessions")
                .get()
                .then(querySnapshot => {
                let sessions = [];
                querySnapshot.forEach(document => {
                    sessions.push(document.data());
                });
                const date = new Date();
                date.setHours(12, 0);
                const timeNow = date.getTime() / 1000;
                admin.firestore().collection("events")
                    .where("lastEval", "<=", 0)
                    .where("timestamp", ">=", timeNow)
                    .get()
                    .then(querySnapshot => {
                    let events = [];
                    querySnapshot.forEach(document => {
                        events.push(document.data());
                    });
                    events = events.filter(event => {
                        let userId = event.userId;
                        let alreadyInSession = false;
                        sessions.forEach(session => {
                            if (session.userIds.indexOf(userId) !== -1) {
                                alreadyInSession = true;
                            }
                        });
                        return !alreadyInSession;
                    });
                    sessions.forEach(session => {
                        let subjectEvents = events.filter(event => event.eval.subject === session.subject);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
}
exports.EventsScheduler = EventsScheduler;
//# sourceMappingURL=events-scheduler.js.map