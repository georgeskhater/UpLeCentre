import {validateFirebaseAdminIdToken} from "../firebase-admin-auth";
import {corsOptions} from "../index";

const admin = require('firebase-admin');
const express = require("express");
const cors = require("cors");

export const addStudentApi = express();
addStudentApi.use(cors(corsOptions));
addStudentApi.use(validateFirebaseAdminIdToken);
addStudentApi.post('/', (request, response) => {
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
    })
});
