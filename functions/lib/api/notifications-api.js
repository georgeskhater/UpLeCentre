"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_event_1 = require("../model/user-event");
const notification_1 = require("../model/notification");
const index_1 = require("../index");
const cors = require("cors");
const express = require("express");
const admin = require("firebase-admin");
const dateFormat = require('dateformat');
exports.notificationsApi = express();
exports.notificationsApi.use(cors(index_1.corsOptions));
exports.notificationsApi.post('*', (request, response) => {
    const dateMorning = new Date();
    dateMorning.setHours(0, 0, 0);
    const dateEvening = new Date();
    dateEvening.setHours(23, 59, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 0);
    const morningTimestamp = dateMorning.getTime();
    const eveningTimestamp = dateEvening.getTime();
    const tomorrowEveningTimestamp = tomorrow.getTime();
    let sessions = [];
    const events = [];
    const notifications = [];
    console.log("Date morning", morningTimestamp);
    console.log("Date evening", eveningTimestamp);
    admin.firestore().collection("user-events")
        .where("timestamp", ">=", morningTimestamp)
        .get()
        .then(snapShot => {
        snapShot.forEach(document => {
            const event = document.data();
            event.id = document.id;
            events.push(event);
        });
        return admin.firestore().collection("user-sessions")
            .where("timestamp", "<=", eveningTimestamp)
            .get();
    })
        .then(snapShot => {
        snapShot.forEach(document => {
            const session = document.data();
            session.id = document.id;
            sessions.push(session);
        });
        sessions = sessions.filter(session => session.note !== null &&
            session.note != undefined && session.eval > 0);
        console.log("Events: ", events);
        console.log("Sessions: ", sessions);
        const todayEvents = events.filter(event => event.timestamp >= eveningTimestamp
            && event.timestamp <= tomorrowEveningTimestamp);
        console.log("Today events: ", todayEvents);
        let eventSessions = [];
        todayEvents.forEach(event => {
            switch (event.category) {
                case user_event_1.UserEvent.CATEGORY_EXERCISE:
                case user_event_1.UserEvent.CATEGORY_CONTROL:
                    eventSessions = sessions.filter(session => session.eventId === event.id);
                    if (eventSessions.length === 0) {
                        const notification = new notification_1.Notification();
                        const category = event.category === user_event_1.UserEvent.CATEGORY_EXERCISE ? "exercise" : "control";
                        notification.message = event.studentName + " had a " + event.subject + " " + category + " but didn't attend any session. " +
                            "Please advice parents";
                        notification.timestamp = morningTimestamp;
                        notifications.push(notification);
                    }
                    break;
                case user_event_1.UserEvent.CATEGORY_EXAM:
                    eventSessions = sessions.filter(session => session.eventId === event.id);
                    if (eventSessions.length < 3) {
                        const notification = new notification_1.Notification();
                        notification.message = event.studentName + " had an exam today but only attended " + eventSessions.length + " sessions";
                        notification.timestamp = morningTimestamp;
                        notifications.push(notification);
                    }
                    break;
            }
        });
        const upcomingEvents = events.filter(event => event.timestamp >= eveningTimestamp
            && event.category === user_event_1.UserEvent.CATEGORY_EXAM);
        console.log("Upcoming events: ", upcomingEvents);
        upcomingEvents.forEach(event => {
            const todaySessions = sessions.filter(session => session.eventId === event.id
                && session.timestamp >= morningTimestamp && session.timestamp <= eveningTimestamp);
            const allSessions = sessions.filter(session => session.eventId === event.id);
            if (todaySessions.length === 0 && allSessions.length < 3) {
                const notification = new notification_1.Notification();
                const remainingTimes = 3 - allSessions.length;
                const displayDate = dateFormat(new Date(event.timestamp), "dd, mmm, yyyy");
                notification.message = event.studentName + " has an upcoming exam on " + displayDate + " and attended "
                    + allSessions.length + " so far, please make sure " + event.studentName + " attends " + remainingTimes
                    + " more session(s)";
                notification.timestamp = morningTimestamp;
                notifications.push(notification);
            }
        });
        console.log("Notifications: ", notifications);
        try {
            notifications.forEach(notification => {
                const docRef = admin.firestore().collection("notifications").doc();
                docRef.set(Object.assign({}, notification));
            });
            const topic = 'adminNotifications';
            const messagesPromises = [];
            notifications.forEach(notification => {
                const message = {
                    notification: {
                        title: "Up lecentre",
                        body: notification.message
                    },
                    topic: topic
                };
                messagesPromises.push(admin.messaging().send(message));
            });
            Promise.all(messagesPromises).then(() => {
                response.status(200).send(JSON.stringify("Notifications added"));
            }).catch(error => {
                console.log(error);
                response.status(500).send(JSON.stringify(error));
            });
        }
        catch (error) {
            console.log(error);
            response.status(500).send(JSON.stringify(error));
        }
    })
        .catch(error => {
        console.log(error);
        response.status(500).send(JSON.stringify(error));
    });
});
//# sourceMappingURL=notifications-api.js.map