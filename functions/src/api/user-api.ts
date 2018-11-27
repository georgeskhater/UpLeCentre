import {validateFirebaseIdToken} from "../firebase-auth";
import * as admin from "firebase-admin";
import {corsOptions} from "../index";

const express = require("express");
const cors = require("cors");

export const userApi = express();
userApi.use(cors(corsOptions));
userApi.use(validateFirebaseIdToken);
userApi.get('/', (request, response) => {
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
      } else {
        response.status(403).send(JSON.stringify('User doesn\'t exists'));
      }
    })
    .catch(error => {
      console.log(error);
      response.status(403).send(JSON.stringify(error));
    });
});
