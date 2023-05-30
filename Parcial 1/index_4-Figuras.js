const Alexa = require('ask-sdk-core');

const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

const languageStrings = {
    en: {
        translation: {
            // Strings con el texto en ingles para cada función
            WELCOME_MESSAGE: 'Welcome, I can calculate the area of a figure, what figure would you like to calculate?',
            NO_FIGURE: 'Sorry, I dont have information on that figure.',
            HELP: 'I can calculate the area of a figure, try saying "what is the area of a circle if it has a radius of 8 centimeters"',
            CANCEL: 'It was a pleasure to have helped you, see you soon.',
            FALLBACK: 'Im sorry I didnt understand what you said.',
            ERROR: 'Sorry, I had trouble doing what you asked. Please try again.',
            RESPONSE: 'The area is  '
        }
    },
    es:{
        translation: {
            // Strings con el texto en español para cada función
            WELCOME_MESSAGE: 'Bienvenido, puedo calcular el area de una figura, ¿de que figura te gustaria calcular?',
            NO_FIGURE: 'Lo siento, no tengo informacion de esa figura.',
            HELP: 'Puedo calcular el area de una figura, prueba diciendo "cual es el area de un circulo si tiene un radio de 8 centimetros".',
            CANCEL: 'Fue un placer haberte ayudado, hasta pronto.',
            FALLBACK:'Lo siento, no entendi lo que dijiste.',
            ERROR: 'Lo siento, tuve problemas para hacer lo que me pediste. Inténtalo de nuevo.',
            RESPONSE: 'El área es '
        }
    }
}


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakOutput = requestAttributes.t('WELCOME_MESSAGE');
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CustomCalcularAreaIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'CalculaArea'
    );
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const resp = requestAttributes.t('RESPONSE');
    
    let result;
    
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    const figura = slots.figura.value;
    
    let base = 0;
    let altura = 0;
    
    if(figura === 'rectangulo' || figura === 'rectángulo' || figura === 'rectangle'){
        // Obtener el valor de los slots si es un rectangulo, aplica en triangulo
        base = slots.base.value;
        altura = slots.altura.value;
        result = base * altura;
    }else if(figura === 'triangulo' || figura === 'triángulo' || figura === 'triangle'){
        base = slots.base.value
        altura = slots.altura.value;
        result = (base*altura) / 2;
    }else if(figura === 'circulo' || figura === 'círculo' || figura === 'circle'){
        // obtener el valor del slot radio siempre que sea circulo
        const radio = slots.radio.value;
        result = Math.PI * radio * radio;
    }
    
    let speakOutput;
    if (!result) {
        speakOutput = requestAttributes.t('NO_FIGURE');
    } else {
        speakOutput = resp + result.toFixed(2);
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};


const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakHelp = requestAttributes.t('HELP');

        return handlerInput.responseBuilder
            .speak(speakHelp)
            .reprompt(speakHelp)
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
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakCancel = requestAttributes.t('CANCEL');
        
        return handlerInput.responseBuilder
            .speak(speakCancel)
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakFallback = requestAttributes.t('FALLBACK');

        return handlerInput.responseBuilder
            .speak(speakFallback)
            .reprompt(speakFallback)
            .getResponse();
    }
};

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

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const speakFallback = requestAttributes.t('ERROR');

        return handlerInput.responseBuilder
            .speak(speakFallback)
            .reprompt(speakFallback)
            .getResponse();
    }
};

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


exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        CustomCalcularAreaIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(LoggingRequestInterceptor, LocalizationInterceptor)
    .addResponseInterceptors(LoggingResponseInterceptor)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
