"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_auth_1 = require("../firebase-auth");
const admin = require("firebase-admin");
const index_1 = require("../index");
const express = require("express");
const cors = require("cors");
exports.userApi = express();
exports.userApi.use(cors(index_1.corsOptions));
exports.userApi.use(firebase_auth_1.validateFirebaseIdToken);
exports.userApi.get('/', (request, response) => {
    const user = request.user;
    admin.firestore().collection('users')
        .where('email', '==', user['email'])
        .limit(1)
        .get()
        .then(querySnapshot => {
        let user = null;
        querySnapshot.forEach(document => {
            user = document.data();
            user.id = document.id;
        });
        if (user) {
            user.token = request.token;
            response.status(200).send(JSON.stringify(user));
        }
        else {
            response.status(403).send(JSON.stringify('User doesn\'t exists'));
        }
    })
        .catch(error => {
        console.log(error);
        response.status(403).send(JSON.stringify(error));
    });
});
//# sourceMappingURL=user-api.js.map