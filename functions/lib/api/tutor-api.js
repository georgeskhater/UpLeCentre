"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_auth_1 = require("../firebase-admin-auth");
const index_1 = require("../index");
const admin = require('firebase-admin');
const express = require("express");
const cors = require("cors");
exports.addTutorApi = express();
exports.addTutorApi.use(cors(index_1.corsOptions));
exports.addTutorApi.use(firebase_admin_auth_1.validateFirebaseAdminIdToken);
exports.addTutorApi.post('/', (request, response) => {
    const tutor = request.body;
    tutor.privilege = 'TUTOR';
    console.log('Adding tutor');
    admin.firestore()
        .collection('privileges')
        .doc('base')
        .get()
        .then(document => {
        const tutors = document.data()['tutors'];
        tutors.push(tutor.email);
        const documentRef = admin.firestore().collection('privileges').doc('base');
        documentRef.set({ tutors: tutors }, { merge: true })
            .then(() => {
            admin.firestore()
                .collection('users')
                .doc(tutor.email)
                .set(tutor, { merge: true })
                .then(() => {
                console.log('Successfully added tutor');
                response.status(200).send(JSON.stringify('success'));
            })
                .catch(error => {
                console.log('Error adding tutor: ', error);
                response.status(403).send(JSON.stringify(error));
            });
        })
            .catch(error => {
            console.log('Error adding tutor: ', error);
            response.status(403).send(JSON.stringify(error));
        });
    })
        .catch(error => {
        console.log('Error adding tutor: ', error);
        response.status(403).send(JSON.stringify(error));
    });
});
//# sourceMappingURL=tutor-api.js.map