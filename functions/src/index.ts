import {loginApi, registerApi} from "./api/auth-api";
import {searchApi} from "./api/search-api";
import {addStudentApi} from "./api/student-api";
import {userApi} from "./api/user-api";
import {addTutorApi} from "./api/tutor-api";
import {emailApi} from "./api/email-api";
import {addEventApi, allEventsApi, recommendationApi} from "./api/events-api";
import {notificationsApi} from "./api/notifications-api";

const serviceAccount = require("../src/service-account.json");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

export const corsOptions = {
  origin: '*',
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://up-le-centre.firebaseio.com",
});

export const register = functions.https.onRequest(registerApi);

export const login = functions.https.onRequest(loginApi);

export const search = functions.https.onRequest(searchApi);

export const addStudent = functions.https.onRequest(addStudentApi);

export const addTutor = functions.https.onRequest(addTutorApi);

export const profile = functions.https.onRequest(userApi);

export const email = functions.https.onRequest(emailApi);

export const event = functions.https.onRequest(addEventApi);

export const recommend = functions.https.onRequest(recommendationApi);

export const notifications = functions.https.onRequest(notificationsApi);

export const events = functions.https.onRequest(allEventsApi);
