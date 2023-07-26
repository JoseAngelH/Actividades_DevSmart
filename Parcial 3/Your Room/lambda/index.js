const Alexa = require('ask-sdk-core');
var persistenceAdapter = getPersistenceAdapter();

const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const languageStrings = require('./localization');
const admin = require("firebase-admin");

const serviceAccount = require("firebase.json");
const marco = require('marcoLegal.js');

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-room-9e781-default-rtdb.firebaseio.com"
});

const DB = admin.firestore();

let DOCUMENT_ID = "";
let countCuarto = 0;
let countMarco = 0;
let countRoomAll = 0;
let countPreferAll = 0;
let countPreferences = 0;
let cuartos = [];
let cuarto = [];
let preferencias = [];
const datasource = {
    "mensaje": {
        "encabezado": "Your room",
        "by": "Creado por:",
        "urlLogo": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/casa.png?alt=media&token=68a5e965-6a2c-4658-934b-bf6495d83d38",
        "titulo": "Bienvenido",
        "msj": "Bienvenido, esta skill tiene la función de ayudarte a buscar tu habitación ideal.",
        "urlImg": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/introduccion.png?alt=media&token=c52aec3e-bad7-4899-9fba-62c6a2746400",
        "footer": "Si quieres ver las formas en las que puedes buscar cuarto di: buscador"
    }
};

const datasourcesSupport = {
        "mensaje": {
            "encabezado": "Your room",
            "by": "Creado por:",
            "urlLogo": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/casa.png?alt=media&token=68a5e965-6a2c-4658-934b-bf6495d83d38",
            "titulo": "Ayuda",
            "msj": "Hola, existen muchas formas en las cuales puedes buscar cuartos. Puede ser en base a al zona, el precio, el tipo de inmueble y si este es compartido",
            "urlImg": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/pregunta.png?alt=media&token=ab491d70-cbc1-4fcf-b2d3-4a78586ffc3c",
            "footer": "Si quieres ver las formas en las que puedes buscar cuarto di: buscador"
        }
    };
    
const  datasourcesSearch = {
        "mensaje": {
            "encabezado": "Your room",
            "by": "Creado por:",
            "urlLogo": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/casa.png?alt=media&token=68a5e965-6a2c-4658-934b-bf6495d83d38",
            "titulo": "Resultados",
            "msj": "Los resultado que encontre fueron los siguientes:",
            "urlImg": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf",
            "footer": "Si deseas ver los demas resultados di: siguiente",
            "Img": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/cuartos%2Fcuarto3.jpg?alt=media&token=50489b69-8a60-4cf0-bc88-d8df31ef4eae",
            "wifi": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fwifi1.png?alt=media&token=6f8e09b8-e98e-423d-b134-a82aaee565e2",
            "agua": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fagua00.png?alt=media&token=f0f80ef2-7dbe-4e29-b27a-b7f4b06202ab",
            "luz": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fluz11.png?alt=media&token=05cea881-1487-4cf9-bb0c-bb6d3f31ef5b",
            "bano": "https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fbano00.png?alt=media&token=d8c32d89-f9b8-4988-841f-3b585895c688",
            "encabezado2": "Detalle",
            "Ecuarto": "Cuarto",
            "Tcuarto": "Individual",
            "Eprecio": "Precio",
            "Tprecio": "1200",
            "Edireccion": "Dirección",
            "Tdireccion": "Av. Juárez s/n, Col. Centro, Huejutla de Reyes, Hgo.",
            "Ereferencia": "Referencia",
            "Treferencia": "Frente a la UTHH"
        }
    };
    
let cuartosDatasources = datasourcesSearch.mensaje;
let launchdata = datasource.mensaje;
let support = datasourcesSupport.mensaje;

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
        
        let speakOutput = requestAttributes.t('WELCOME_MESSAGE');
        let foot = requestAttributes.t('APL_WELCOME');
        
        preferencias = sessionAttributes['preferencias'];
        countPreferAll = preferencias.length;
        if(countPreferAll > 0){
            speakOutput = requestAttributes.t('LOAD_DATA', countPreferAll);
            foot = requestAttributes.t('APL_LOAD');
        }
        
        let inicio = speakOutput.indexOf(".");
        let parteAnterior = speakOutput.substring(0, inicio);
        
        launchdata.msj = parteAnterior;
        launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/introduccion.png?alt=media&token=c52aec3e-bad7-4899-9fba-62c6a2746400';
        launchdata.footer = foot;
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "BienvenidaDocument";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        countCuarto = 0;
        countMarco = 0;
        countPreferences = 0;
        cuartos = [];
        cuarto = [];
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const MarcoLegalIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'marcoLegalIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const request = handlerInput.requestEnvelope.request;
        const userLocale = request.locale;
        let speakOutput = '';
        let marcoLegal;
        let nombre;
        let titulo = '';
        let msg = '';
        let footer;
        if (userLocale.startsWith('es')) {
            nombre = 'Marco Legal de la Skill de Alexa "Your Room"';
            marcoLegal = marco.marcoEspañol;
            msg = 'Estas han sido todos los puntos del marco legal.'
            footer = 'Si deseas saber más, di: "siguiente punto".';
        } else if (userLocale.startsWith('en')) {
            nombre = 'Legal Framework of the Alexa Skill "Your Room"';
            marcoLegal = marco.marcoIngles;
            msg = 'All the points of the legal framework have been.'
            footer = 'If you want to know more, say: "next point".';
        }
        if(countMarco < marcoLegal.length){
            titulo = marcoLegal[countMarco].titulo;
            msg = marcoLegal[countMarco].texto1;
            countMarco++;
        }
        else{
            titulo = nombre;
            footer = '';
        }
        speakOutput = msg;
        support.titulo = titulo;
        support.msj = msg;
        support.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/marco.png?alt=media&token=bdca8e8a-59a1-419d-8978-25f782a2b948';
        support.footer = footer;
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "supportDocument";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasourcesSupport);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const searchIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'searchIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        const zona = intent.slots.zona.value;
        cuartos = [];
        let speakOutput = '';
        let snapshot;
        let parametroBusqueda = '';
        countRoomAll = 0;
        countCuarto = 0;
        
        if(zona){
            if(zona.toLowerCase() === 'aviacion civil' || zona.toLowerCase() === 'civil aviation'){
                parametroBusqueda = 'Aviacion Civil';
            }
            else if(zona.toLowerCase() === 'centro' || zona.toLowerCase() === 'center'){
                parametroBusqueda = 'Centro';
            }
            else if(zona.toLowerCase() === 'parque de poblamiento' || zona.toLowerCase() === 'settlement park'){
                parametroBusqueda = 'Parque de Poblamiento';
            }
            
            snapshot = await DB.collection('rooms').where('Zona', '==', parametroBusqueda).where('estado', '==', 'Disponible').get();
            cuartos = snapshot.docs;
            countRoomAll = snapshot.docs.length;
            if(countRoomAll){
                speakOutput = requestAttributes.t('SEARCH_ZONE', countRoomAll, zona);
                let inicio = speakOutput.indexOf(".");
                let parteAnterior = speakOutput.substring(0, inicio);
                launchdata.msj = parteAnterior;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
                launchdata.footer = requestAttributes.t('COMPLETION_SEARCH');
            }
            else{
                speakOutput = requestAttributes.t('NO_RESULT');
                launchdata.msj = speakOutput;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
                launchdata.footer = requestAttributes.t('APL_WELCOME');
            }
        }
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "BienvenidaDocument";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const searchPriceIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'searchPriceIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        const zona = intent.slots.zona.value;
        const condicion = intent.slots.condicion.value;
        let precio = intent.slots.precio.value;
        
        let speakOutput = '';
        
        let snapshot;
        let parametroBusqueda = '';
        let condicionBusqueda = '';
        countRoomAll = 0;
        countCuarto = 0;
        
        if(zona.toLowerCase() === 'aviacion civil' || zona.toLowerCase() === 'civil aviation'){
            parametroBusqueda = 'Aviacion Civil';
        }
        else if(zona.toLowerCase() === 'centro' || zona.toLowerCase() === 'center'){
            parametroBusqueda = 'Centro';
        }
        else if(zona.toLowerCase() === 'parque de poblamiento' || zona.toLowerCase() === 'settlement park'){
            parametroBusqueda = 'Parque de Poblamiento';
        }
        
        snapshot = await DB.collection('rooms').where('Zona', '==', parametroBusqueda).where('estado', '==', 'Disponible').get();
        let resultado = snapshot.docs;
        let count = 0;
        for (count; count < resultado.length; count++){
            let cuartoSel = resultado[count]._fieldsProto;
            let precioCuarto = cuartoSel.precio.stringValue;
            if(condicion.toLowerCase() === 'menor' || condicion.toLowerCase === 'less'){
                if (parseFloat(precioCuarto) <= precio){
                    cuartos.push(resultado[count]);
                }
            }
            else{
                if (parseFloat(precioCuarto) >= precio){
                    cuartos.push(resultado[count]);
                }
            }
        }
        
        countRoomAll = cuartos.length;
        if(countRoomAll){
            speakOutput = requestAttributes.t('SEARCH_ZONE', countRoomAll, zona);
            let inicio = speakOutput.indexOf(".");
            let parteAnterior = speakOutput.substring(0, inicio);
            launchdata.msj = parteAnterior;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
            launchdata.footer = requestAttributes.t('COMPLETION_SEARCH');
        }
        else{
            speakOutput = requestAttributes.t('NO_RESULT');
            launchdata.msj = speakOutput;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
            launchdata.footer = requestAttributes.t('APL_WELCOME');
        }
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "BienvenidaDocument";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const searchCompanyIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'searchCompanyIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        const zona = intent.slots.zona.value;
        const compania = intent.slots.compania.value;
        cuartos = [];
        let speakOutput = '';
        let snapshot;
        let parametroBusqueda = '';
        let parametroCompania = ''
        countRoomAll = 0;
        countCuarto = 0;
        
        if(zona){
            if(zona.toLowerCase() === 'aviacion civil' || zona.toLowerCase() === 'civil aviation'){
                parametroBusqueda = 'Aviacion Civil';
            }
            else if(zona.toLowerCase() === 'centro' || zona.toLowerCase() === 'center'){
                parametroBusqueda = 'Centro';
            }
            else if(zona.toLowerCase() === 'parque de poblamiento' || zona.toLowerCase() === 'settlement park'){
                parametroBusqueda = 'Parque de Poblamiento';
            }
            if(compania.toLowerCase() === 'individual'){
                parametroCompania = 'Individual';
            }
            else{
                parametroCompania = 'Compartido';
            }
            
            snapshot = await DB.collection('rooms').where('Zona', '==', parametroBusqueda).where('estado', '==', 'Disponible').where('compania', '==', parametroCompania).get();
            cuartos = snapshot.docs;
            countRoomAll = snapshot.docs.length;
            if(countRoomAll){
                speakOutput = requestAttributes.t('SEARCH_ZONE', countRoomAll, zona);
                let inicio = speakOutput.indexOf(".");
                let parteAnterior = speakOutput.substring(0, inicio);
                launchdata.msj = parteAnterior;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
                launchdata.footer = requestAttributes.t('COMPLETION_SEARCH');
            }
            else{
                speakOutput = requestAttributes.t('NO_RESULT');
                launchdata.msj = speakOutput;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
                launchdata.footer = requestAttributes.t('APL_WELCOME');
            }
        }
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "BienvenidaDocument";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const searchTypeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'searchTypeIntent';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const {intent} = handlerInput.requestEnvelope.request;
        const zona = intent.slots.zona.value;
        const inmueble = intent.slots.inmueble.value;
        cuartos = [];
        let speakOutput = '';
        let snapshot;
        let parametroBusqueda = '';
        let parametroInmueble = ''
        countRoomAll = 0;
        countCuarto = 0;
        
        if(zona){
            if(zona.toLowerCase() === 'aviacion civil' || zona.toLowerCase() === 'civil aviation'){
                parametroBusqueda = 'Aviacion Civil';
            }
            else if(zona.toLowerCase() === 'centro' || zona.toLowerCase() === 'center'){
                parametroBusqueda = 'Centro';
            }
            else if(zona.toLowerCase() === 'parque de poblamiento' || zona.toLowerCase() === 'settlement park'){
                parametroBusqueda = 'Parque de Poblamiento';
            }
            if(inmueble.toLowerCase() === 'piso' || inmueble.toLowerCase() === 'floor'){
                parametroInmueble = 'Piso';
            }
            else{
                parametroInmueble = 'Cuarto';
            }
            
            snapshot = await DB.collection('rooms').where('Zona', '==', parametroBusqueda).where('estado', '==', 'Disponible').where('inmueble', '==', parametroInmueble).get();
            cuartos = snapshot.docs;
            countRoomAll = snapshot.docs.length;
            if(countRoomAll){
                speakOutput = requestAttributes.t('SEARCH_ZONE', countRoomAll, zona);
                let inicio = speakOutput.indexOf(".");
                let parteAnterior = speakOutput.substring(0, inicio);
                launchdata.msj = parteAnterior;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
                launchdata.footer = requestAttributes.t('COMPLETION_SEARCH');
            }
            else{
                speakOutput = requestAttributes.t('NO_RESULT');
                launchdata.msj = speakOutput;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
                launchdata.footer = requestAttributes.t('APL_WELCOME');
            }
        }
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "BienvenidaDocument";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const viewIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'viewRoom';
    },
    async handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const request = handlerInput.requestEnvelope.request;
        const userLocale = request.locale;
        
        let speakOutput = '';
        cuarto = [];
        countPreferences = 0;
        DOCUMENT_ID = '';
        let data;
        
        if(cuartos.length){
            if( countCuarto < countRoomAll){
                cuarto = cuartos[countCuarto]._fieldsProto;
                let indice = Math.floor(Math.random() * 10);
                const desc = requestAttributes.t('DESCRIPTION');
                const titulo = desc[indice].description;
                const compania = cuarto.compania.stringValue;
                const precio = cuarto.precio.stringValue;
                const direccion = cuarto.direccion.stringValue;
                const servicios = cuarto.servicios.stringValue;
                const ref = cuarto.referencia.stringValue;
                const bano = cuarto.baño.stringValue;
                let agua = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fagua00.png?alt=media&token=f0f80ef2-7dbe-4e29-b27a-b7f4b06202ab';
                let luz = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fluz00.png?alt=media&token=f4072b7e-3714-4e80-a906-262940b346f1'; 
                let internet = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fwifi0.png?alt=media&token=6b1585f8-ae03-4f65-9781-b65eae2d0560';
                let banio = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fbano00.png?alt=media&token=d8c32d89-f9b8-4988-841f-3b585895c688';
                
                if(servicios.includes('Agua')){
                    agua = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fagua11.png?alt=media&token=8f40f70b-fe6a-40ea-b1d2-aacefbfea980'
                }
                if(servicios.includes('Internet')){
                    internet = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fwifi1.png?alt=media&token=6f8e09b8-e98e-423d-b134-a82aaee565e2'
                }
                if(servicios.includes('Luz')){
                    luz = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fluz11.png?alt=media&token=05cea881-1487-4cf9-bb0c-bb6d3f31ef5b'
                }
                if(bano === 'Individual'){
                    banio = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fbano11.png?alt=media&token=31f3d37c-6fef-4838-a4c5-54edf229a76f'
                }
                
                let comp = compania;
                if (userLocale.startsWith('en') && compania === 'Compartido') {
                    comp = 'Shared';
                }
    
                speakOutput = titulo + requestAttributes.t('completion');
                let etiquetas = requestAttributes.t('ETIQUETAS');
                let foot = requestAttributes.t('FOOTER_RES');
                cuartosDatasources.encabezado2 = titulo;
                cuartosDatasources.Tcuarto = ':'+comp;
                cuartosDatasources.Tprecio = ': $ '+precio;
                cuartosDatasources.Tdireccion = ':'+direccion;
                cuartosDatasources.wifi = internet;
                cuartosDatasources.agua = agua;
                cuartosDatasources.luz = luz;
                cuartosDatasources.Treferencia = ':'+ref;
                cuartosDatasources.bano = banio;
                cuartosDatasources.Ecuarto = etiquetas[0];
                cuartosDatasources.Eprecio = etiquetas[1];
                cuartosDatasources.Edireccion = etiquetas[2];
                cuartosDatasources.Ereferencia = etiquetas[3];
                cuartosDatasources.footer = foot;
                
                DOCUMENT_ID = "searchDocument";
                data = datasourcesSearch;
                cuarto = {
                    'descripcion': titulo,
                    'compania': comp,
                    'precio': precio,
                    'direccion': direccion,
                    'servicios': servicios,
                    'referencia': ref,
                    'baño': bano,
                }
                
                countCuarto++;
            }
            else{
                speakOutput = requestAttributes.t('NO_MORE_ROOMS');
                launchdata.msj = speakOutput;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/no_more.png?alt=media&token=346da210-01d4-480f-86ad-2a7c49f91a47';
                launchdata.footer = '';
                DOCUMENT_ID = "BienvenidaDocument";
                data = datasource;
            }
        }else{
            speakOutput = requestAttributes.t('NO_ROOM');
            DOCUMENT_ID = "BienvenidaDocument";
            data = datasource;
            launchdata.msj = speakOutput;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/errorsave.jpg?alt=media&token=5e0c619b-40f3-47d8-9ce3-04549350332e';
            launchdata.footer = requestAttributes.t('APL_WELCOME');
        }
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, data);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const savePreferenciasIntenHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'savePreferences';
    },
    handle(handlerInput){
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = '';
        if(cuarto !== null){
            try{
                preferencias.push(cuarto);
                sessionAttributes['preferencias'] = preferencias;
                countPreferAll = preferencias.length;
                speakOutput = requestAttributes.t('SAVE_DATA');
                let inicio = speakOutput.indexOf(".");
                let parteAnterior = speakOutput.substring(0, inicio);
                launchdata.msj = parteAnterior;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/save.png?alt=media&token=1512b6da-1806-4e35-8c19-cb7c6c4da033';
                launchdata.footer = requestAttributes.t('APL_LOAD');
            }
            catch(e){
                speakOutput = requestAttributes.t('NO_SAVE');
                launchdata.msj = speakOutput;
                launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/errorsave.jpg?alt=media&token=5e0c619b-40f3-47d8-9ce3-04549350332e';
                launchdata.footer = '';
            }
        }else{
            speakOutput = requestAttributes.t('NO_ROOM');
            launchdata.msj = speakOutput;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/errorsave.jpg?alt=media&token=5e0c619b-40f3-47d8-9ce3-04549350332e';
            launchdata.footer = requestAttributes.t('APL_WELCOME');
        }
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            DOCUMENT_ID = "BienvenidaDocument";
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const viewPreferencesHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'viewPreferences';
    },
    handle(handlerInput) {
        const {attributesManager} = handlerInput;
        const requestAttributes = attributesManager.getRequestAttributes();
        const sessionAttributes = attributesManager.getSessionAttributes();
        let speakOutput = '';
        let data;
        
        preferencias = sessionAttributes['preferencias'];
        if(!preferencias.length){
            speakOutput = requestAttributes.t('MISSING_DATA');
            launchdata.msj = speakOutput;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/buscar.png?alt=media&token=3a32ccff-777b-44dd-8415-817bf814e5cf';
            launchdata.footer = requestAttributes.t('APL_WELCOME');
            DOCUMENT_ID = "BienvenidaDocument";
            data = datasource;
        }
        else if (countPreferences < countPreferAll) {
            let cuartopre = preferencias[countPreferences];
            
            const titulo = cuartopre.descripcion;
            const compania = cuartopre.compania;
            const precio = cuartopre.precio;
            const direccion = cuartopre.direccion;
            const servicios = cuartopre.servicios;
            const ref = cuartopre.referencia;
            const bano = cuartopre.baño;
            let agua = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fagua00.png?alt=media&token=f0f80ef2-7dbe-4e29-b27a-b7f4b06202ab';
            let luz = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fluz00.png?alt=media&token=f4072b7e-3714-4e80-a906-262940b346f1'; 
            let internet = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fwifi0.png?alt=media&token=6b1585f8-ae03-4f65-9781-b65eae2d0560';
            let banio = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fbano00.png?alt=media&token=d8c32d89-f9b8-4988-841f-3b585895c688';
            
            if(servicios.includes('Agua')){
                agua = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fagua11.png?alt=media&token=8f40f70b-fe6a-40ea-b1d2-aacefbfea980'
            }
            if(servicios.includes('Internet')){
                internet = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fwifi1.png?alt=media&token=6f8e09b8-e98e-423d-b134-a82aaee565e2'
            }
            if(servicios.includes('Luz')){
                luz = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fluz11.png?alt=media&token=05cea881-1487-4cf9-bb0c-bb6d3f31ef5b'
            }
            if(bano === 'Individual'){
                banio = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/iconos%2Fbano11.png?alt=media&token=31f3d37c-6fef-4838-a4c5-54edf229a76f'
            }
            speakOutput = titulo + requestAttributes.t('completion_prefer');
            
            cuartosDatasources.encabezado2 = titulo;
            cuartosDatasources.Tcuarto = ':' + compania;
            cuartosDatasources.Tprecio = ': $'+precio;
            cuartosDatasources.Tdireccion = ':'+direccion;
            cuartosDatasources.wifi = internet;
            cuartosDatasources.agua = agua;
            cuartosDatasources.luz = luz;
            cuartosDatasources.Treferencia = ':'+ref;
            cuartosDatasources.bano = banio;
            cuartosDatasources.footer = requestAttributes.t('FOOTER_PREF');
            
            DOCUMENT_ID = "searchDocument";
            data = datasourcesSearch;
            
            countPreferences++
        }
        else{
            speakOutput = requestAttributes.t('NO_MORE_PREFER');
            launchdata.msj = speakOutput;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/no_more.png?alt=media&token=346da210-01d4-480f-86ad-2a7c49f91a47';
            launchdata.footer = requestAttributes.t('');
            DOCUMENT_ID = "BienvenidaDocument";
            data = datasource;
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, data);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const clearPreferenciasIntenHandler = {
    canHandle(handlerInput){
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
        && Alexa.getIntentName(handlerInput.requestEnvelope) === 'deletePreferences';
    },
    handle(handlerInput){
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = '';
        preferencias = [];
        DOCUMENT_ID = "BienvenidaDocument";
        try{
            sessionAttributes['preferencias'] = preferencias;
            countPreferAll = 0;
            speakOutput = requestAttributes.t('RESTORE_DATA');
            launchdata.msj = speakOutput;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/delete.png?alt=media&token=de8fa4d1-50cc-426c-941a-3f16690e8a04';
            launchdata.footer = requestAttributes.t('APL_WELCOME');
        }
        catch(e){
            speakOutput = requestAttributes.t('ERROR');
            launchdata.msj = speakOutput;
            launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/no_more.png?alt=media&token=346da210-01d4-480f-86ad-2a7c49f91a47';
            launchdata.footer = '';
        }
        
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
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
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const list_help = requestAttributes.t('HELP_LIST');
        let complet = ' ' + list_help[0] + ', ' + list_help[1] + ', '  +list_help[2] + ' o ' +list_help[3];
        const speakOutput = requestAttributes.t('HELP');
        // HELP_LIST
        cuartosDatasources.encabezado2 = speakOutput;
        cuartosDatasources.Tcuarto = '◉ '+list_help[0];
        cuartosDatasources.Tprecio = '◉ '+list_help[1];
        cuartosDatasources.Tdireccion = '◉ '+list_help[2];
        cuartosDatasources.Treferencia = '◉ '+list_help[3];
        cuartosDatasources.Ecuarto = '';
        cuartosDatasources.Eprecio = '';
        cuartosDatasources.Edireccion = '';
        cuartosDatasources.Ereferencia = '';
        cuartosDatasources.wifi = '';
        cuartosDatasources.agua = '';
        cuartosDatasources.luz = '';
        cuartosDatasources.bano = '';
        cuartosDatasources.footer = '';
        cuartosDatasources.Img = 'https://firebasestorage.googleapis.com/v0/b/resources-ac435.appspot.com/o/question.png?alt=media&token=9f0a2d03-3f62-45b4-ad58-d07b628243ed';
        
        DOCUMENT_ID = "searchDocument";
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasourcesSearch);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput + complet)
            .reprompt(speakOutput + complet)
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
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let speakOutput = requestAttributes.t('CANCEL');
        
        if(preferencias.length){
            sessionAttributes['preferencias'] = preferencias;
            speakOutput = requestAttributes.t('CANCEL_PERS');
        }
        
        launchdata.msj = speakOutput;
        launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/exit.png?alt=media&token=8e3de879-92ef-441c-9c3d-6129dc35ad89';
        launchdata.footer = '';
        
        DOCUMENT_ID = "BienvenidaDocument";
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
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
        const speakOutput = requestAttributes.t('FALLBACK');
        
        launchdata.msj = speakOutput;
        launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/notunder.png?alt=media&token=7d1fa991-3740-428b-b596-b55b1c8aa6eb';
        launchdata.footer = '';
        
        DOCUMENT_ID = "BienvenidaDocument";
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
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
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = requestAttributes.t('REFLECTOR', intentName);
        // const speakOutput = `You just triggered ${intentName}`;
        
        launchdata.msj = speakOutput;
        launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/error.png?alt=media&token=07c0b7c3-68f4-48fd-9f31-58058f155f14';
        launchdata.footer = '';
        
        DOCUMENT_ID = "BienvenidaDocument";
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }
        
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
        const speakOutput = requestAttributes.t('ERROR');
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);
        
        launchdata.msj = speakOutput;
        launchdata.urlImg = 'https://firebasestorage.googleapis.com/v0/b/your-room-9e781.appspot.com/o/errorsave.jpg?alt=media&token=5e0c619b-40f3-47d8-9ce3-04549350332e';
        launchdata.footer = '';
        
        DOCUMENT_ID = "BienvenidaDocument";
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            const aplDirective = createDirectivePayload(DOCUMENT_ID, datasource);
            handlerInput.responseBuilder.addDirective(aplDirective);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
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
        MarcoLegalIntentHandler,
        searchIntentHandler,
        searchPriceIntentHandler,
        searchCompanyIntentHandler,
        searchTypeIntentHandler,
        viewIntentHandler,
        savePreferenciasIntenHandler,
        viewPreferencesHandler,
        clearPreferenciasIntenHandler,
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
