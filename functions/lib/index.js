"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_api_1 = require("./api/auth-api");
const search_api_1 = require("./api/search-api");
const student_api_1 = require("./api/student-api");
const user_api_1 = require("./api/user-api");
const tutor_api_1 = require("./api/tutor-api");
const email_api_1 = require("./api/email-api");
const events_api_1 = require("./api/events-api");
const notifications_api_1 = require("./api/notifications-api");
const serviceAccount = require("../src/service-account.json");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

exports.corsOptions = {
  origin: "*",
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Content-Length",
    "X-Requested-With",
    "Accept"
  ],
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://up-le-centre.firebaseio.com"
});
exports.register = functions.https.onRequest(auth_api_1.registerApi);
exports.login = functions.https.onRequest(auth_api_1.loginApi);
exports.search = functions.https.onRequest(search_api_1.searchApi);
exports.addStudent = functions.https.onRequest(student_api_1.addStudentApi);
exports.addTutor = functions.https.onRequest(tutor_api_1.addTutorApi);
exports.profile = functions.https.onRequest(user_api_1.userApi);
exports.email = functions.https.onRequest(email_api_1.emailApi);
exports.event = functions.https.onRequest(events_api_1.addEventApi);
exports.recommend = functions.https.onRequest(events_api_1.recommendationApi);
exports.notifications = functions.https.onRequest(
  notifications_api_1.notificationsApi
);
exports.events = functions.https.onRequest(events_api_1.allEventsApi);
//# sourceMappingURL=index.js.map
