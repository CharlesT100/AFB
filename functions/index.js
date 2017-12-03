const functions = require('firebase-functions');
const firebase = require('firebase-admin');
const express = require('express');

const firebaseApp = firebase.initialize(
    functions.config().firebase
);

const app = express();
app.get('/df', (request, response) =>{
    response.send(`${Date.now()}`);
});

app.get('slk', (request, response) =>{
    response.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    repsonse.send(`${Date.now()}`);
});

exports.app = functions.https.onRequest(app);

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
