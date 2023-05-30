/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
// i18n dependencies. i18n is the main module, sprintf allows us to include variables with '%s'.
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');

const languageStrings = {
    en: {
        translation: {
            // Strings con el texto en ingles para cada función
            WELCOME_MESSAGE: 'Welcome, I can convert units of measurement to the English system, try saying "Convert 4 meters to feet". Which would you like to try?',
            ERROR_UNIT: 'The unit of measure is not available',
            ERROR_CONVERTION: 'The amount you want to convert is not available or is not supported',
            HELP: 'I can convert units of measurement to the English system, try saying "convert 5 meters to inches"',
            CANCEL: 'It was a pleasure helping you, bye.',
            FALLBACK: 'Im sorry, I dont understand what you said.',
            ERROR_HANDLER: 'Sorry, I had trouble doing what you asked. Please try again.',
            TEXT: 'is equal to'
        }
    },
    es:{
        translation: {
            // Strings con el texto en español para cada función
            WELCOME_MESSAGE: 'Bienvenido, puedo convertir unidades de medida al sistema ingles, prueba diciendo "Pasa 4 metros a pies". ¿Cuál te gustaría probar?',
            ERROR_UNIT: 'La unidad de medida no se encuentra disponible.',
            ERROR_CONVERTION: 'La cantidad que desas convertir no esta disponible o no es compatible.',
            HELP: 'Puedo convertir unidades de medida al sitema ingles, prueba diciendo "convierte 5 metros a pulgadas"',
            CANCEL: 'Fue un gusto ayudarte, Adios.',
            FALLBACK:'Perdon, no entiendi lo que has dicho.',
            ERROR_HANDLER: 'Lo siento, tuve problemas para hacer lo que me pediste. Inténtalo de nuevo.',
            TEXT: 'es igual a'
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

const ConvertirUnidadesHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'ConvertirUnidades'
    );
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const text = requestAttributes.t('TEXT');
    let resultado;
    let speakOutput;
    
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    const valor = parseFloat(slots.valor.value);
    const unidadOrigen = slots.unidad_origen.value;
    const unidadDestino = slots.unidad_destino.value;

    if(valor > 0){
        if (unidadOrigen === 'metro' || unidadOrigen === 'metros' || unidadOrigen === 'meter' || unidadOrigen === 'meters') {
            if (unidadDestino === 'pulgada' || unidadDestino === 'pulgadas' || unidadDestino === 'inch' || unidadDestino === 'inches') {
                resultado = valor * 39.37;
            } else if (unidadDestino === 'pie' || unidadDestino === 'pies' || unidadDestino === 'foot' || unidadDestino === 'feet') {
                resultado = valor * 3.281;
            } else if (unidadDestino === 'yarda' || unidadDestino === 'yardas' || unidadDestino === 'yard' || unidadDestino === 'yards') {
                resultado = valor * 1.094;
            } else if (unidadDestino === 'milla' || unidadDestino === 'millas' || unidadDestino === 'mile' || unidadDestino === 'miles') {
                resultado = valor * 0.0006214;
            }
        } 
        
        if (unidadOrigen === 'centímetro' || unidadOrigen === 'centímetros' || unidadOrigen === 'centimeters' || unidadOrigen === 'centimeter') {
            if (unidadDestino === 'pulgada' || unidadDestino === 'pulgadas' || unidadDestino === 'inch' || unidadDestino === 'inches') {
                resultado = valor * 0.3937;
            } else if (unidadDestino === 'pie' || unidadDestino === 'pies' || unidadDestino === 'foot' || unidadDestino === 'feet') {
                resultado = valor * 0.0328084; 
            } else if (unidadDestino === 'yarda' || unidadDestino === 'yardas' || unidadDestino === 'yard' || unidadDestino === 'yards') {
                resultado = valor * 0.01094;
            } else if (unidadDestino === 'milla' || unidadDestino === 'millas' || unidadDestino === 'mile' || unidadDestino === 'miles') {
                resultado = valor * 0.0000062137;
            }
        }
        if (!resultado) {
          speakOutput = requestAttributes.t('ERROR_UNIT');;
        }
        speakOutput = `${valor} ${unidadOrigen} ${text} ${resultado.toFixed(2)} ${unidadDestino}`;
    }else{
        speakOutput = requestAttributes.t('ERROR_CONVERTION');;
    }

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  }
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
        return handlerInput.responseBuilder.getResponse();
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
        const speakHandler = requestAttributes.t('ERROR_HANDLER');
        
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakHandler)
            .reprompt(speakHandler)
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
        ConvertirUnidadesHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .addRequestInterceptors(LoggingRequestInterceptor, LocalizationInterceptor)
    .addResponseInterceptors(LoggingResponseInterceptor)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
