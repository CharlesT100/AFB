const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
let serviceAccount = require("./serviceAccountKey.json");

// const express = require('express');

// const app = express();
// app.post('/dfpostmsg', (request, response) =>{
//     response.send('Hello From Firebase');
// });

// app.get('/dfpostqs', (request, response) =>{
//     response.send('Hello From Firebase');
// });

// app.get('/slk', (request, response) =>{
//     response.send('Hello From Firebase');
// });
// exports.app = functions.https.onRequest(app);

exports.createDdfTest = functions.https.onRequest((req, res) => {
  response.send("hello y'all");
});



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

        'add.chatbotIntent': () => {

            const question = parameters['question'];
            const answer = parameters['answer'];
            // const example = parameters['code-example'];

            //Make call to DialogFlow SDK
            function createIntents(projectId, req){

                const dialogFlow = require('dialogflow');
                const parameters = req.body.queryResult.parameters; 

                const question = parameters['question'];
                const answer = parameters['answer'];
                
                
                 // Instantiates clients
                 const contextsClient = new dialogflow.ContextsClient();
                 const intentsClient = new dialogflow.IntentsClient();

                 // The path to identify the agent that owns the created intent.
                 const agentPath = intentsClient.projectAgentPath(projectId);

                 // Set the question to be 'user says' within intent
                 const afbPhrases = [
                    {type: 'TYPE_EXAMPLE', parts: [{text: question }]},
                  ];
                  console.log(afbPhrases);

                 // Setup the intent
                 const afbIntent = {
                    displayName: 'Dummy Intent',
                    events: ['dummy_event'],
                    // Webhook is disabled because we are not ready to call the webhook yet.
                    webhookState: 'WEBHOOK_STATE_DISABLED',
                    trainingPhrases: afbPhrases,
                    mlEnabled: true,
                    priority: 500000,
                    result: answer,
                  };
                  console.log(afbIntent);

                  // Associate intent to the parent/agentPath
                  const afbRequest = {
                    parent: agentPath,
                    intent: afbIntent,
                  };
                  console.log(afbRequest);

                  // Create the intent
                    intentsClient
                    .createIntent(afbRequest)
                    .then(responses => {
                        console.log('Created A New Intent:');
                        logIntent(responses[0]);
                    })
                    .catch(err => {
                        console.error('ERROR:', err);
                    });
            }
            //Send response to Dialog Flow
            const afbMessage = formatResponse('This message via Cloud Function and the add.chatbotIntent action, the question was:' + question);
            console.log(afbMessage);
            res.json(afbMessage)

        }, // end of add.chatbotIntent
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
        fulfillmentText: text,
        // data: {},
        // contextOut: [],
        // source: '',
        // followupEvent: {}
    }
}

// function formatResponse(text) {
//     return {
//         speech: text,
//         displayText: text,
//         data: {},
//         contextOut: [],
//         source: '',
//         followupEvent: {}
//     }
// }

// // Setup Param
// const afbParameters = [
// {
//     displayName: 'question',
//     value: question,
//     entityTypeDisplayName: '@sys.text',
// },
// {
//     displayName: 'answer',
//     value: answer,
//     entityTypeDisplayName: '@sys.text',
//     isList: false,
// },
// ];

// const afbResult = {
// action: 'afb_confirm',
// parameters: afbParameters,
// messages: [
//     {
//     text: {
//         text: [
//         'We added the question: $question with the answer of: $answer.',
//         ],
//     },
//     },
// ],
// // Conclude the conversation by setting no output contexts and setting
// // resetContexts to true. This clears all existing contexts.
// outputContexts: [],
// resetContexts: true,
// };
