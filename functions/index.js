const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

let serviceAccount = require("./serviceAccountKey.json");

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
            
            const userRef = db.collection('users').doc('test-user');
            const question = parameters['question'];
            const answer = parameters['answer'];

            userRef.update({ myquestion: question, myanswer: answer}).then(() =>{   
                
            function createIntents(question, answer){  
                
                const dialogflow = require('dialogflow');
                const projectId = 'afb-crucqn';
            
                const contextsClient = new dialogflow.ContextsClient();
                const intentsClient = new dialogflow.IntentsClient();
                const agentPath = intentsClient.projectAgentPath(projectId);

                // Set the question variable to be 'user says' within df intent
                const afbPhrases = [
                    {type: 'TYPE_EXAMPLE', parts: [{text: question }]},
                ];

                // Setup Param
                const afbParameters = [
                    {
                        displayName: 'question',
                        value: question,
                        entityTypeDisplayName: '@sys.text',
                    },
                    {
                        displayName: 'answer',
                        value: answer,
                        entityTypeDisplayName: '@sys.text',
                        isList: false,
                    },
                ];

                const afbResult = {
                    action: 'afb_dummy_action',
                    parameters: afbParameters,
                    messages: [
                        {
                        text: {
                            text: [
                            'We added the question: $question with the answer of: $answer.',
                            ],
                        },
                        },
                    ],
                    // Conclude the conversation by setting no output contexts and setting
                    // resetContexts to true. This clears all existing contexts.
                    outputContexts: [],
                    resetContexts: true,
                };
            
                // Setup the intent
                const afbIntent = {
                    displayName: 'Dummy Intent',
                    events: ['dummy_event'],
                    // Webhook is disabled because we are not ready to call the webhook yet.
                    webhookState: 'WEBHOOK_STATE_DISABLED',
                    trainingPhrases: afbPhrases,
                    mlEnabled: true,
                    priority: 500000,
                    result: afbResult,
                };                                
                            
                // Associate intent to the parent/agentPath, passed into createIntent fn
                const afbRequest = {
                    parent: agentPath,
                    intent: afbIntent,
                };
                
                // Create the intent
                intentsClient
                .createIntent(afbRequest)
                    .then(responses => {
                        console.log('Created A New Intent:');
                        // logIntent(responses[0]);
                        console.log(responses[0]);
                    }) 
                    .catch(err => {
                        console.error('ERROR:', err);
                    });
            } // end of creareIntents fn
            
                return createIntents();
                const afbMessage = formatResponse('This message via Cloud Function and the add.chatbotIntent action, the question was:');
                res.json(afbMessage)
            })

        }, // end of add.chatbotIntent action
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



