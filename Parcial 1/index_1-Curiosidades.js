/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');

const languageFacts = {
    "javascript" : [
        "es un lenguaje usado principalmente para desarrollo web.",
        "es un lenguaje dinámico.",
        "está basado en prototipos."
        ],
    "python" : [
        "fue nombrado en honor al grupo de comedia británico Monty Python.",
        "es un lenguaje de programación interpretado, lo que significa que no necesita ser compilado antes de ejecutarse.",
        "es muy popular en campos como la inteligencia artificial, el aprendizaje automático, la ciencia de datos y la automatización de tareas."
        ],
    "java" : [
        "El nombre original de Java era 'Oak', pero se cambió a 'Java' en honor al café Java, que es conocido por su calidad y sabor.",
        "es uno de los lenguajes de programación más utilizados en el desarrollo de aplicaciones Android.",
        "El lema oficial de Java es 'Write once, run anywhere', lo que significa que el código Java puede ejecutarse en cualquier plataforma que tenga una máquina virtual Java (JVM) instalada."
        ],
    "peachepe" : [
        "es un lenguaje orientado al back-end.",
        "PHP originalmente significaba 'Personal Home Page' (Página Personal), pero más tarde se cambió a 'PHP: Hypertext Preprocessor'",
        " Se estima que más del 75% de los sitios web dinámicos utilizan PHP en su backend."
        ],
    "ruby" : [
        "Ruby se basa en el principio de 'la felicidad del programador'. ",
        "Ruby tomó inspiración de varios lenguajes de programación, incluyendo Perl, Smalltalk, Eiffel y Lisp.",
        "Ruby tiene una sintaxis flexible y permite diferentes estilos de programación."
        ],
    "cmasmas" : [
        "C++ es una extensión del lenguaje de programación C.",
        "El nombre 'C++' se refiere al incremento en la funcionalidad del lenguaje en comparación con C.",
        "C++ introduce el concepto de templates, que permiten la creación de funciones y clases genéricas. "
        ]
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Hola,' +
        'puedo darte datos curiosos de algun lenguaje de programación,' +
        'di algo como "prueba JavaScript"';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CustomLanguageIntentHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CustomLanguageIntent';
  },
  handle(handlerInput) {
    const { language } = handlerInput.requestEnvelope.request.intent.slots;
    let response;
    if (language && languageFacts[language.value]) {
      response = languageFacts[language.value][Math.floor(Math.random() * languageFacts[language.value].length)];
    } else {
      response = "No tengo información sobre el lenguaje que has mencionado, prueba con otro.";
    }

    const reprompt = '¿Se te ofrece algo más?';
    const speechOutput = response + ' ' + reprompt;

    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(reprompt)
      .getResponse();
  },
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'puedo darte datos curiosos de algun lenguaje de programación, di algo como "prueba JavaScript"';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Que las buenas practicas te acompañen y tengas buen código!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        CustomLanguageIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();