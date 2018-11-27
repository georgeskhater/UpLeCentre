import * as admin from "firebase-admin";

export const validateFirebaseIdToken = (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');

  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
    (!req.cookies || (req.cookies && !req.cookies.__session))) {
    console.error('No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>');
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
      admin.auth().getUser(decodedToken.uid)
        .then(user => {
          console.log('ID Token correctly decoded');
          req.user = user;
          req.token = idToken;
          next();
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
