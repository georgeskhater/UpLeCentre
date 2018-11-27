"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_auth_1 = require("../firebase-auth");
const admin = require("firebase-admin");
const index_1 = require("../index");
const express = require("express");
const cors = require("cors");
exports.searchApi = express();
exports.searchApi.use(cors(index_1.corsOptions));
exports.searchApi.use(firebase_auth_1.validateFirebaseIdToken);
exports.searchApi.get('/students', (request, response) => {
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
exports.searchApi.get('/tutors', (request, response) => {
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
//# sourceMappingURL=search-api.js.map