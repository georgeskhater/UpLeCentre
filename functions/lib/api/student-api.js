"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_auth_1 = require("../firebase-admin-auth");
const index_1 = require("../index");
const admin = require('firebase-admin');
const express = require("express");
const cors = require("cors");
exports.addStudentApi = express();
exports.addStudentApi.use(cors(index_1.corsOptions));
exports.addStudentApi.use(firebase_admin_auth_1.validateFirebaseAdminIdToken);
exports.addStudentApi.post('/', (request, response) => {
    const student = request.body;
    console.log('Adding student');
    admin.firestore()
        .collection('users')
        .add(student)
        .then(() => {
        console.log('Successfully added student');
        response.status(200).send(JSON.stringify('success'));
    })
        .catch(error => {
        console.log('Error adding student: ', error);
        response.status(403).send(JSON.stringify(error));
    });
});
//# sourceMappingURL=student-api.js.map