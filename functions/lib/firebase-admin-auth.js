"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
exports.validateFirebaseAdminIdToken = (req, res, next) => {
    console.log('Check if request is authorized with Firebase ID token');
    if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
        (!req.cookies || (req.cookies && !req.cookies.__session))) {
        console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.', 'Make sure you authorize your request by providing the following HTTP header:', 'Authorization: Bearer <Firebase ID Token>');
        res.status(403).send('Unauthorized');
        return;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        console.log('Found "Authorization" header');
        idToken = req.headers.authorization.split('Bearer ')[1];
    }
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
        console.log('ID Token correctly decoded');
        admin.auth().getUser(decodedToken.uid)
            .then(user => {
            console.log(user.email);
            admin.firestore().collection('users')
                .get()
                .then(querySnapshot => {
                let isAdmin = false;
                querySnapshot.forEach(document => {
                    const data = document.data();
                    console.log(data);
                    if (decodedToken['email'] === data['email'] && data['privilege'] === 'ADMIN') {
                        isAdmin = true;
                    }
                });
                if (isAdmin) {
                    next();
                }
                else {
                    console.error('Error while verifying Firebase ID token: NOT AN ADMIN !');
                    res.status(401).send('Unauthorized');
                }
            })
                .catch(error => {
                console.error('Error while verifying Firebase ID token:', error);
                res.status(401).send('Unauthorized');
            });
        })
            .catch(error => {
            console.error('Error while verifying Firebase ID token:', error);
            res.status(401).send('Unauthorized');
        });
    })
        .catch(error => {
        console.error('Error while verifying Firebase ID token:', error);
        res.status(401).send('Unauthorized');
    });
};
//# sourceMappingURL=firebase-admin-auth.js.map