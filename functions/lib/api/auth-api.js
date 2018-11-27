"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
exports.registerApi = express();
exports.registerApi.use(cors(index_1.corsOptions));
exports.registerApi.post("*", (request, response) => {
  const email = request.query.email;
  const password = request.query.password;
  const firstName = request.query.firstName;
  const lastName = request.query.lastName;
  if (!email || !password || !firstName || !lastName) {
    response
      .status(403)
      .send(
        "Pass 'email', 'password', 'firstName' and 'lastName' as query params."
      );
    return;
  }
  admin
    .firestore()
    .collection("privileges")
    .doc("base")
    .get()
    .then(document => {
      const data = document.data();
      let privilege = "STUDENT";
      data["tutors"].forEach(tutorEmail => {
        if (email === tutorEmail) {
          privilege = "TUTOR";
        }
      });
      data["admins"].forEach(adminEmail => {
        if (email === adminEmail) {
          privilege = "ADMIN";
        }
      });
      if (privilege === "STUDENT") {
        response
          .status(401)
          .send(
            JSON.stringify(
              "Failed to authenticate: user is not a tutor or admin"
            )
          );
      } else {
        admin
          .auth()
          .createUser({
            email: email,
            password: password,
            displayName: firstName + " " + lastName
          })
          .then(() => {
            admin
              .firestore()
              .collection("users")
              .doc(email)
              .set(
                {
                  email: email,
                  firstName: firstName,
                  lastName: lastName,
                  privilege: privilege
                },
                { merge: true }
              )
              .then(() => {
                admin
                  .firestore()
                  .collection("users")
                  .doc(email)
                  .get()
                  .then(snapShot => {
                    const returnUser = snapShot.data();
                    returnUser.id = snapShot.id;
                    response.status(200).send(JSON.stringify(returnUser));
                  })
                  .catch(error => {
                    console.log(error);
                    response
                      .status(401)
                      .send(JSON.stringify("Failed to authenticate: " + error));
                  });
              })
              .catch(error => {
                console.log(error);
                response
                  .status(401)
                  .send(JSON.stringify("Failed to authenticate: " + error));
              });
          })
          .catch(error => {
            console.log(error);
            response
              .status(401)
              .send(JSON.stringify("Failed to authenticate: " + error));
          });
      }
    })
    .catch(error => {
      console.log(error);
      response.status(403).send(JSON.stringify(error));
    });
});
exports.loginApi = express();
exports.loginApi.use(cors(index_1.corsOptions));
exports.loginApi.post("/", (request, response) => {
  const idToken = request.query.token;
  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      const userUid = decodedToken.uid;
      admin
        .auth()
        .getUser(userUid)
        .then(user => {
          admin
            .firestore()
            .collection("users")
            .where("email", "==", user.email)
            .limit(1)
            .get()
            .then(querySnapshot => {
              let data = null;
              querySnapshot.forEach(document => {
                data = document.data();
                data.token = idToken;
                data.id = document.id;
              });
              if (data.revoked && data.revoked === true) {
                response.status(401).send(JSON.stringify(data));
              } else {
                response.status(200).send(JSON.stringify(data));
              }
            });
        })
        .catch(error => {
          console.log("Failed to authenticate", error);
          response.status(401).send();
        });
    })
    .catch(error => {
      console.log("Failed to authenticate", error);
      response.status(401).send();
    });
});
//# sourceMappingURL=auth-api.js.map
