const Alexa = require('ask-sdk-core');
var persistenceAdapter = getPersistenceAdapter();

const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const languageStrings = require('./localization');


function getPersistenceAdapter() {
    function isAlexaHosted() {
        return process.env.S3_PERSISTENCE_BUCKET ? true : false;
    }
    const tableName = 'user_info';
    if(isAlexaHosted()) {
        const {S3PersistenceAdapter} = require('ask-sdk-s3-persistence-adapter');
        return new S3PersistenceAdapter({
            bucketName: process.env.S3_PERSISTENCE_BUCKET
        });
    } else {
        const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
        return new DynamoDbPersistenceAdapter({
            tableName: tableName,
            createTable: true
        });
    }
}

const marcoAll = require('./marcoLegal');
const marco = marcoAll.marco;

let countRecomendacion = 0;
let countMarco = 0;
let name;
let IMC = 0;
let idioma = '';
let etiqueta = '';
let idioma_etiqueta = '';
let DOCUMENT_ID = "";

let datasource1 = {
    "RecomenDataSources": {
        "primaryText": "EJERCICIO",
        "secondaryText": "El ejercicio es un factor clave para mantenerse saludable. El ejercicio fortalece los huesos, el corazón y los pulmones, tonifica los músculos, mejora la vitalidad, alivia la depresión y ayuda a conciliar mejor el sueño.",
        "imagen": "https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/ejercicio.png?alt=media&token=270413d0-1681-4134-a938-7b16bb56bddc",
        "thirdText": "Si deseas otra recomendación, di 'Siguiente'"
    }
};

let datasource2 = {
    "marcoDataSources": {
        "primaryText": "Introducción",
        "secondaryText": "◉ La Skill de Alexa 'Vida Saludable' (en adelante, 'la Skill') es una aplicación desarrollada para proporcionar recomendaciones generales a los usuarios sobre cómo llevar una vida saludable. La Skill no recopila ni procesa ningún dato personal del usuario y no requiere ningún tipo de entrada de datos por parte del usuario.",
        "thirdText": "◉ Al utilizar la Skill, usted acepta cumplir con los términos y condiciones establecidos en este marco legal. Si no está de acuerdo con estos términos, no utilice la Skill."
    }
};

let datasourcesIntent = {
        "IntentDataSources": {
            "primaryText": "Bienvenido, puedo ofrecerte recomendaciones de salud en base a la información de la OMS.",
            "secondaryText": "Prueba diciendo: 'Recomiendame algo' o 'ver marco legal', o puedes decir 'registra mi información'.",
            "imagen": "https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/hola.png?alt=media&token=5837c360-1e1b-4e5c-93be-6033704caf68",
            "thirdText": "Recuerda que esta informacion no sustituye ninguna ayuda profesional."
        }
    }


let RecomiendDataSources = datasource1.RecomenDataSources;
let marcoDataSources = datasource2.marcoDataSources;
let IntentDataSources = datasourcesIntent.IntentDataSources;

const createDirectivePayload = (aplDocumentId, dataSources = {}, tokenId = "documentToken") => {
    return {
        type: "Alexa.Presentation.APL.RenderDocument",
        token: tokenId,
        document: {
            type: "Link",
            src: "doc://alexa/apl/documents/" + aplDocumentId
        },
        datasources: dataSources
    }
};

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        name = sessionAttributes['name'];
        IMC = sessionAttributes['IMC'];
        etiqueta = sessionAttributes['etiqueta'];
        idioma_etiqueta = sessionAttributes['idioma_etiqueta'];
        const altura = sessionAttributes['altura'];
        const peso = sessionAttributes['peso'];
        const edad = sessionAttributes['edad'];
        const idiomaOld = sessionAttributes['idioma']
        let newIdioma = requestAttributes.t('IDIOMA')
        idioma = newIdioma;
        if (newIdioma !== idiomaOld){
            etiqueta = idioma_etiqueta;
        }
        
        let speakOutput = requestAttributes.t('WELCOME_MESSAGE');
        if(name && IMC){
            speakOutput = requestAttributes.t('LOAD_DATA', name, IMC, etiqueta);
        }
        
        DOCUMENT_ID = "LaunchTemplate";
        
        if(idioma === "ESPAÑOL"){
            IntentDataSources.primaryText = "Bienvenido, puedo ofrecerte recomendaciones de salud en base a la información de la OMS.";
            IntentDataSources.secondaryText = "Prueba diciendo: 'Recomiendame algo' o 'ver marco legal', o puedes decir 'registra mi información'.";
            if(name){
                IntentDataSources.primaryText = "Bienvenido de nuevo " + name; // + ", puedo ofrecerte recomendaciones de salud en base a la información de la OMS.";    
                IntentDataSources.secondaryText = speakOutput;
            }
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/hola.png?alt=media&token=5837c360-1e1b-4e5c-93be-6033704caf68';
            IntentDataSources.thirdText = "Recuerda que esta informacion no sustituye ninguna ayuda profesional.";
        }else{
            IntentDataSources.primaryText = "Welcome, I can offer you health recommendations based on information from the OMS."
            IntentDataSources.secondaryText = "Try saying: 'Recommend something to me' or 'view legal framework', or you can say 'register my information'."
            if(name){
                IntentDataSources.primaryText = "Welcome back " + name; //+ ", I can offer you health recommendations based on information from the OMS.";    
                IntentDataSources.secondaryText = speakOutput;
            }
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/hola.png?alt=media&token=5837c360-1e1b-4e5c-93be-6033704caf68'
            IntentDataSources.thirdText = "Remember that this information does not replace any professional assistance."
        }
        
        countRecomendacion = 0;
        countMarco = 0;
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasourcesIntent);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const RegisterUserHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'registerInfo';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        
        const nombre = intent.slots.nombre.value;
        const altura = intent.slots.altura.value;
        const peso = intent.slots.peso.value;
        const edad = intent.slots.edad.value;
        name = nombre.toUpperCase();
        IMC = parseFloat(peso / (altura*altura));
        IMC = IMC.toFixed(2);
        if (IMC < 18.5) {
          etiqueta = requestAttributes.t('desnutrición');
          idioma_etiqueta = requestAttributes.t('IDIOMADES');
        } else if (IMC >= 18.5 && IMC < 25) {
          etiqueta = requestAttributes.t('normal');
          idioma_etiqueta = requestAttributes.t('IDIOMANOR');
        } else if (IMC >= 25 && IMC < 30) {
          etiqueta = requestAttributes.t('sobrepeso');
          idioma_etiqueta = requestAttributes.t('IDIOMASOBR');
        } else {
          etiqueta = requestAttributes.t('obesidad');
          idioma_etiqueta = requestAttributes.t('IDIOMAOBES');
        }
        let idioma = requestAttributes.t('IDIOMA')
        sessionAttributes['name'] = name;
        sessionAttributes['altura'] = altura;
        sessionAttributes['peso'] = peso;
        sessionAttributes['edad'] = edad;
        sessionAttributes['IMC'] = IMC;
        sessionAttributes['etiqueta'] = etiqueta;
        sessionAttributes['idioma_etiqueta'] = idioma_etiqueta;
        sessionAttributes['idioma'] = idioma;
        countRecomendacion = 0;
        
        DOCUMENT_ID = "LaunchTemplate";
        let speakOutput = requestAttributes.t('REGISTER', name, IMC, etiqueta);
        let inicio, titulo;
        if(idioma === "ESPAÑOL"){
            inicio = speakOutput.indexOf("Puedes pedir");
            titulo = "Registro Completo";
        }
        else{
            inicio = speakOutput.indexOf("You can");
            titulo = "Full Register";
        }
        let parteAnterior = speakOutput.substring(0, inicio);
        let parteDeseada = speakOutput.substring(inicio);
        IntentDataSources.primaryText = titulo;
        IntentDataSources.secondaryText = parteAnterior;
        IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/registro.png?alt=media&token=4c415a0d-f327-4034-b4ca-7059e1bda650'
        IntentDataSources.thirdText = parteDeseada + '!!';
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasourcesIntent);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}


const RecomendacionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'recomendacionIntent';
    },
    handle(handlerInput) {
        try {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        let completion = requestAttributes.t('completion');
        let recomendaciones = requestAttributes.t(etiqueta);
        let speakOutput = '';
        
        if(countRecomendacion < recomendaciones.length){
            const titulo = recomendaciones[countRecomendacion].title;
            const texto = recomendaciones[countRecomendacion].text;
            const img = recomendaciones[countRecomendacion].image;
            speakOutput = texto + completion;

            RecomiendDataSources.primaryText = titulo;
            RecomiendDataSources.secondaryText = texto;
            RecomiendDataSources.imagen = img;
            if(idioma === 'ESPAÑOL'){
                RecomiendDataSources.thirdText = 'Si deseas otra recomendación, di "Siguiente"';
            }
            else{
                RecomiendDataSources.thirdText = 'If you want another recommendation, say "Next"';
            }

            countRecomendacion++;
        }
        else {
            if(idioma === "ESPAÑOL"){
                speakOutput = 'Esas han sido mis recomendaciones por ahora, es importante tenerlas en cuenta.';
                RecomiendDataSources.primaryText = 'Cuídate';
                RecomiendDataSources.secondaryText = 'Ten en cuenta las recomendaciones para lograr una vida saludable.';
                RecomiendDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/help.png?alt=media&token=6b0fe063-b194-4810-927a-fa45cb5bd98a';
                RecomiendDataSources.thirdText = 'Recuerda que estas recomendaciones no sustituyen la ayuda de un profesional';
            }else{
                speakOutput = "Those have been my recommendations for now, it is important to take them into account.";
                RecomiendDataSources.primaryText = "Take care";
                RecomiendDataSources.secondaryText = "Keep in mind the recommendations to achieve a healthy life.";
                RecomiendDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/help.png?alt=media&token=6b0fe063-b194-4810-927a-fa45cb5bd98a';
                RecomiendDataSources.thirdText = ' Remember that this information does not replace any professional assistance';
            }
          countRecomendacion = 0;
        }


        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "RecomienTemplate";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource1);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        } catch (error) {
            console.error('Error en el intent RecomendacionIntentHandler:', error);
            const errorMessage = 'Lo siento, hubo un error al obtener la recomendación. Por favor, intenta de nuevo más tarde.';
            return handlerInput.responseBuilder
                .speak(errorMessage)
                .getResponse();
        }
    }
};



const MarcoIntentHnadler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'marcoLegalIntent';
    },
    handle(handlerInput) {
        let speakOutput = '';
        
        if(countMarco < marco.length){
            const titulo = marco[countMarco].titulo;
            const texto1 = marco[countMarco].texto1;
            const texto2 = marco[countMarco].texto2;
            speakOutput = texto1 + ' ' + texto2 + " Si deseas conocer más, di 'Siguiente punto'";
            
            marcoDataSources.primaryText = titulo;
            marcoDataSources.secondaryText = texto1;
            marcoDataSources.thirdText = texto2;
            
            countMarco++;
        }
        else{
            marcoDataSources.primaryText = "Estos han sido los puntos del marco legal. Es importante tenerlos en cuenta.";
            marcoDataSources.secondaryText = '';
            marcoDataSources.thirdText = '';
            
            speakOutput = "Estos han sido los puntos del marco legal. Es importante tenerlos en cuenta.";
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "marcoTemplate";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource2);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        // const speakOutput = 'Puedo darte recomendaciones para tener una vida saludable, prueba diciendo: "recomiendame algo"';
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('HELP');
        
        if(idioma === "ESPAÑOL"){
            IntentDataSources.primaryText = "Hola, puedo darte recomendaciones para una vida saludable.";
            IntentDataSources.secondaryText = "Prueba diciendo: 'Recomiendame algo' o 'ver marco legal', o puedes decir 'registra mi información'.";
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/help.png?alt=media&token=6b0fe063-b194-4810-927a-fa45cb5bd98a';
            IntentDataSources.thirdText = "Recuerda que esta informacion no sustituye ninguna ayuda profesional.";
        }else{
            IntentDataSources.primaryText = "Hi, I can offer you health recommendations based on information from the WHO."
            IntentDataSources.secondaryText = "Try saying: 'Recommend something to me' or 'view legal framework', or you can say 'register my information'."
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/help.png?alt=media&token=6b0fe063-b194-4810-927a-fa45cb5bd98a'
            IntentDataSources.thirdText = "Remember that this information does not replace any professional assistance."
        }

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            DOCUMENT_ID = "LaunchTemplate";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasourcesIntent);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

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
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        if (IMC < 18.5) {
          idioma_etiqueta = requestAttributes.t('IDIOMADES');
        } else if (IMC >= 18.5 && IMC < 25) {
          idioma_etiqueta = requestAttributes.t('IDIOMANOR');
        } else if (IMC >= 25 && IMC < 30) {
          idioma_etiqueta = requestAttributes.t('IDIOMASOBR');
        } else {
          idioma_etiqueta = requestAttributes.t('IDIOMAOBES');
        }
        
        sessionAttributes['name'] = name;
        sessionAttributes['IMC'] = IMC;
        sessionAttributes['idioma_etiqueta'] = idioma_etiqueta;
        sessionAttributes['etiqueta'] = etiqueta;
        sessionAttributes['idioma'] = idioma;
        
        if(idioma === "ESPAÑOL"){
            IntentDataSources.primaryText = "Adios, Fue un gusto haberte ayudado.";
            IntentDataSources.secondaryText = "¡Espero verte pronto, recuerda comer frutas y verduras!";
            if(name){
                IntentDataSources.primaryText = "Adios " + name + ", Cuidate y toma en cuenta las recomendaciones.";    
            }
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/adios.png?alt=media&token=ffa91ded-1cd0-4528-b3a1-d55c69bba104';
            IntentDataSources.thirdText = "";
        }else{
            IntentDataSources.primaryText = "Goodbye, it was a pleasure to assist you."
            IntentDataSources.secondaryText = "Hope to see you soon, remember to eat fruits and vegetables!"
            if(name){
                IntentDataSources.primaryText = "Goodbye " + name + ", take care and consider the recommendations.";
            }
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/adios.png?alt=media&token=ffa91ded-1cd0-4528-b3a1-d55c69bba104';
            IntentDataSources.thirdText = "";
        }
        
        const speakOutput = requestAttributes.t('CANCEL');
        // const speakOutput = 'Adios, fue un gusto ayudarte, recuerda comer frutas y verduras!';
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // generate the APL RenderDocument directive that will be returned from your skill
            DOCUMENT_ID = "LaunchTemplate";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasourcesIntent);
            // add the RenderDocument directive to the responseBuilder
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

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
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('FALLBACK');
        
        if(idioma === "ESPAÑOL"){
            IntentDataSources.primaryText = "Lo siento, no entendi lo que dijiste.";
            IntentDataSources.secondaryText = "Prueba diciendo: 'Recomiendame algo' o 'ver marco legal'.";
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/question.png?alt=media&token=9f0a2d03-3f62-45b4-ad58-d07b628243ed';
            IntentDataSources.thirdText = "";
        }else{
            IntentDataSources.primaryText = "Sorry, I didn't understand what you said."
            IntentDataSources.secondaryText = "Try saying: 'Recommend something to me' or 'view legal framework'."
            IntentDataSources.imagen = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/question.png?alt=media&token=9f0a2d03-3f62-45b4-ad58-d07b628243ed'
            IntentDataSources.thirdText = ""
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "LaunchTemplate";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource2);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

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
 
 
// FUNCIONES PARA SABER EL IDIOMA
const LoggingRequestInterceptor = {
    process(handlerInput){
        console.log(`Incoming request: ${JSON.stringify(handlerInput.requestEnvelope.request)}`);
    }
};

const LoggingResponseInterceptor = {
    process(handlerInput, response) {
        console.log(`Outgoing response: ${JSON.stringify(response)}`);
    }
};

const LocalizationInterceptor = {
    process(handlerInput) {
        const LocalizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
            fallbackLng: 'en',
            overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
            resources: languageStrings,
            returnObjects: true
        });
        
        const attributes = handlerInput.attributesManager.getRequestAttributes();
        attributes.t = function(...args){
            return LocalizationClient.t(...args);
        }
    }
};


const LoadAttributesInterceptor = {
    async process(handlerInput) {
        if(handlerInput.requestEnvelope.session['new']){
            const {attributesManager} = handlerInput;
            const persistentAttributes = await attributesManager.getPersistentAttributes() || {};
            handlerInput.attributesManager.setSessionAttributes(persistentAttributes);
        }
    }
};

const SaveAttributesResponseInterceptor = {
    async process(handlerInput, response) {
        const {attributesManager} = handlerInput;
        const sessionAttributes = attributesManager.getSessionAttributes();
        const shouldEndSession = (typeof response.shouldEndSession === 'undefined' ? true : response.shouldEndSession);
        if(shouldEndSession || handlerInput.requestEnvelope.request.type === 'SessionEndedRequest') {
            attributesManager.setPersistentAttributes(sessionAttributes);
            await attributesManager.savePersistentAttributes();
        }
    }
};
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        RegisterUserHandler,
        RecomendacionIntentHandler,
        MarcoIntentHnadler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(
        LoggingRequestInterceptor, 
        LocalizationInterceptor,
        LoadAttributesInterceptor
        )
    .addResponseInterceptors(
        LoggingResponseInterceptor,
        SaveAttributesResponseInterceptor
        )
    .withPersistenceAdapter(persistenceAdapter)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();