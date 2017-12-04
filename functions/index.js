const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const express = require('express');
let serviceAccount = require("./serviceAccountKey.json");

const app = express();
app.post('/dfpostmsg', (request, response) =>{

// function that retreives the text sent and adds
});

app.get('/dfpostqs', (request, response) =>{
    response.send('Hello From Firebase');
});

app.get('/slk', (request, response) =>{
    response.send('Hello From Firebase');
});

exports.app = functions.https.onRequest(app);

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((req, res) => {
    
    console.log('Request headers: ' + JSON.stringify(req.headers));
    console.log('Request body: ' + JSON.stringify(req.body));
    
    let action = req.body.queryResult.action; 
    const parameters = req.body.queryResult.parameters; 
    const inputContexts = req.body.queryResult.contexts;
    const requestSource = (req.body.originalRequest) ? req.body.originalRequest.source : undefined;
    
    // Firestore database
    const db = admin.firestore()
    const actionHandlers = {
        'phone.update': () => { 
            const userRef = db.collection('users').doc('test-user');
            const phoneNumber = parameters['phone-number'];
            // Make update in firestore
            userRef.update({ phone: phoneNumber }).then(() => {
                /// successful update - send response to dialogflow
                const data = formatResponse('No problem. Phone number is updated in Firestore!')
                res.json(data)
            })
        },
        'default': () => {
            const data = formatResponse('Hi. I am the default response from the Cloud Function')
        }
    }

    if (!actionHandlers[action]) { // Missing action will call default function. 
        action = 'default';
    }
    actionHandlers[action](); // Call the handler with action type
});

function formatResponse(text) { // Helper to format the response JSON object
    return {
        speech: text,
        displayText: text,
        data: {},
        contextOut: [],
        source: '',
        followupEvent: {}
    }
}
