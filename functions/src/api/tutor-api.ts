import {validateFirebaseAdminIdToken} from "../firebase-admin-auth";
import {corsOptions} from "../index";

const admin = require('firebase-admin');
const express = require("express");
const cors = require("cors");

export const addTutorApi = express();
addTutorApi.use(cors(corsOptions));
addTutorApi.use(validateFirebaseAdminIdToken);
addTutorApi.post('/', (request, response) => {
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
      documentRef.set({tutors: tutors}, {merge: true})
        .then(() => {
          admin.firestore()
            .collection('users')
            .doc(tutor.email)
            .set(tutor, {merge: true})
            .then(() => {
              console.log('Successfully added tutor');
              response.status(200).send(JSON.stringify('success'));
            })
            .catch(error => {
              console.log('Error adding tutor: ', error);
              response.status(403).send(JSON.stringify(error));
            })
        })
        .catch(error => {
          console.log('Error adding tutor: ', error);
          response.status(403).send(JSON.stringify(error));
        })
    })
    .catch(error => {
      console.log('Error adding tutor: ', error);
      response.status(403).send(JSON.stringify(error));
    });
});
