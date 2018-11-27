import {validateFirebaseIdToken} from "../firebase-auth";
import * as admin from "firebase-admin";
import {corsOptions} from "../index";

const express = require("express");
const cors = require("cors");

export const searchApi = express();
searchApi.use(cors(corsOptions));
searchApi.use(validateFirebaseIdToken);
searchApi.get('/students', (request, response) => {
  let searchQuery = request.query.searchQuery;
  console.log('Search query:', searchQuery);
  if (!searchQuery) {
    response.status(403).send(JSON.stringify('Pass \'searchQuery\' as query param'));
    return;
  }
  console.log(request.query.branchKey);
  admin.firestore().collection('users')
    .where('privilege', '==', 'STUDENT')
    .where('branch', '==', request.query.branchKey)
    .get()
    .then(querySnapshot => {
      searchQuery = searchQuery.toLowerCase().replace(' ', '');
      const users = [];
      querySnapshot.forEach(document => {
        const data = document.data();
        const searchField = (data['firstName'] + data['lastName']).toLowerCase().replace(' ', '');
        console.log(searchField);
        if (searchField.indexOf(searchQuery) !== -1) {
          const newUser = document.data();
          newUser.id = document.id;
          users.push(newUser);
        }
      });
      console.log('Users', users.length);
      response.status(200).send(JSON.stringify(users));
    })
    .catch(error => {
      response.status(403).send(JSON.stringify('Error occurred: ' + error));
    });
});

searchApi.get('/tutors', (request, response) => {
  let searchQuery = request.query.searchQuery;
  console.log('Search query:', searchQuery);
  if (!searchQuery) {
    response.status(403).send(JSON.stringify('Pass \'searchQuery\' as query param'));
    return;
  }
  admin.firestore().collection('users')
    .where('privilege', '==', 'TUTOR')
    .where('branch', '==', request.query.branchKey)
    .get()
    .then(querySnapshot => {
      searchQuery = searchQuery.toLowerCase().replace(' ', '');
      const users = [];
      querySnapshot.forEach(document => {
        const data = document.data();
        const searchField = (data['firstName'] + data['lastName']).toLowerCase().replace(' ', '');
        console.log(searchField);
        if (searchField.indexOf(searchQuery) !== -1) {
          const newUser = document.data();
          newUser.id = document.id;
          users.push(newUser);
        }
      });
      console.log('Users', users.length);
      response.status(200).send(JSON.stringify(users));
    })
    .catch(error => {
      response.status(403).send(JSON.stringify('Error occurred: ' + error));
    });
});
