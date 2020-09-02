// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management, session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');

const SKILL_NAME = "barman at home";
const STOP_MESSAGE = "Alla prossima.";
const CANCEL_MESSAGE = "Okay. Vorresti provare un altro drink?";

const HELP_START = "Posso aiutarti a preparare i tuoi drink preferiti.";
const HELP_START_REPROMPT = "Dimmi che tipo di cocktail vorresti.";
const HELP_RECIPE = "Scegli qualsiasi cocktail tu voglia";
const HELP_RECIPE_REPROMPT = "Chiedimi come fare un cocktail";
const HELP_INSTRUCTIONS = "Puoi chiedermi di ripetere le istruzioni oppure di 'prossima' per continuare";
const HELP_INSTRUCTIONS_REPROMPT = "Ciao.";
const HELP_CANCEL = "Puoi chiedermi un altro drink oppure semplicemente uscire.";
const HELP_CANCEL_REPROMPT = "Rimanere sobri è follia.";

const CHOOSE_TYPE_MESSAGE = "Benvenuto a Barman at Home! Ho a disposizione un sacco di drink a base di rum, gin, whiskey o vodka. Quale preferisci?";
const REPROMPT_TYPE = "Scusami, quale tipo di drink vorresti? Puoi scegliere un cocktail con base uno di questi ingredienti: gin, rum, whiskey o vodka.";
const TYPE_NOT_IN_LIST = chosenType => `Mi dispiace, non ho trovato drink che si possono fare con ${chosenType}. Al momento abbiamo a disposizione gin, rum, whiskey o vodka. Preferisci uno dei seguenti alcolici per cominciare?`;

const RECIPE_ADJECTIVES = [
    ". Lo servono nei migliori locali. ",
    ". Sicuramente non rimarrai sobrio con questo. ",
    ". Forte e ricco di gusto. ",
];
const SUGGEST_RECIPE = recipeName => `Ho trovato ${recipeName}! Che ne pensi?`;
const MISUNDERSTOOD_RECIPE_ANSWER = "Per favore, rispondi con si o no";
const NO_REMAINING_RECIPE = "Mi dispiace ma non ho più un catalogo. Preferisci un altro drink?"
const INGREDIENTS_INTRO = "Ti serviranno"; // Seguiranno gli ingredienti della ricetta
const INGREDIENTS_ENDING = "Sembra fatto apposta per te. Che ne pensi?"; // Will be said after the list of ingredients

const FIRST_TIME_INSTRUCTIONS = "Pronuncia 'continua' per continuare con le istruzioni. ";
const REPROMPT_INSTRUCTIONS = "Pronuncia 'continua' per continuare con le istruzioni ";
const MISUNDERSTOOD_INSTRUCTIONS_ANSWER = "Scusami, ma non ho capito.";
const CLOSING_MESSAGE = "Ottimo! Abbiamo finito, ci vediamo al prossimo cocktail";

var choice ={
    base: '',
    drink: '',
    instructions: '',
    ingredients: '',
};

var CHOSEN_BASE;
var istruzione = 0;

function random_from_array(array){
	return array[Math.floor(Math.random()*array.length)];
}

const recipes = {
    'gin': [
        {
            name: "dry martini",
            instructions: [
                "Per preparare il Dry Martini",
                "per prima cosa riempite il vostro mixing glass con del ghiaccio",
                "Versate il gin e poi il vermouth dry direttamente nel mixing glass.",
                "Mescolate il tutto con il bar spoon.",
                "Versate il contenuto del mixing glass nella coppa raffreddata in freezer. ",
		            "Accompagnate il Martini con delle olive o delle scorze di limone."
            ],
            ingredients: [
                "60 millilitri di gin",
                "10 millilitri di vermountdry",
                "scorza di limone ",
                "olive verdi",
                "ghiaccio"
            ]
        },

	 {
            name: "negroni",
            instructions: [
                "Per preparare il Negroni versate il bitter Campari nel bicchiere.",
                "Aggiungete poi il Vermouth rosso. ",
                "A questo punto versate il gin."
                "Il passo successivo è quello di aggiungere del ghiaccio",
		            "poi Mescolate e guarnite il vostro Negroni con una fetta di arancia",
                "Campai!"
            ],
            ingredients: [
                "30 millilitri di gin",
                "30 millilitri di bitter Campari o Martini",
                "30 millilitri di Vermounth rosso  ",
                "una fetta di arancia",
                " e del ghiaccio"
            ]
        },



    ],
    'vodka': [{
            name: "cosmopolitan",
            instructions: [
                "Per prima cosa, ancora prima di preparare il Cosmopolitan mettete in freezer la coppetta nella quale servirete il vostro cocktail",
		        "in modo da averla ben ghiacciata. In uno shaker versate il succo di lime, adoperando il jigger, dosatore da barman molto preciso.Versate poi anche il succo di mirtillo rosso.",
                "Procedete con la parte alcolica: cointreau e vodka.",
                "Con l'aiuto di una pinza, aggiungete il ghiaccio a cubetti fino a riempimento della campana di acciaio più piccola che compone lo shaker.",
                "Inserite tre cubetti di ghiaccionel mixing tin (la campana più grande) dello shaker. Chiudete le due parti dello shaker.Agitate in modo vigoroso.",
		"Versate il tutto nel bicchiere precedentemente ghiacciato, bloccando il ghiaccio con l'aiuto di uno strainer.",
		"Completate il vostro Cosmopolitan con una fettina di lime posto al centro del drink con l'aiuto di una pinza.Salute."
            ],
            ingredients: [
                "40 millilitri di vodka",
                "15 millilitri di cointreau (liquore francese)",
                "15 millilitri di succo di lime  ",
                "30 millilitri di succo di mirtillo rosso",
		"un lime",
                "ghiaccio"
            ]
        },
        {
            name: "white russian",
            instructions: [
                "Per preparare il White Russian cominciate versando direttamente nel bicchiere tumbler basso la vodka e poi il liquore al caffè.",
                "Aggiungete dei cubetti di ghiaccio fino a riempimento del bicchiere, aiutandovi con una pinza per evitare contaminazioni.",
                "Mescolate gentilmente con un bar spoon, cucchiaio dal manico lungo utilizzato per miscelare i cocktail. A questo punto semimontate la panna in uno shaker e versatela come top del cocktail.",
                "Completate il vostro White Russian con dei chicchi di caffè come guarnizione. Buona serata!"
            ],
            ingredients: [
                "Gli ingredienti per il White russian sono pochissimi vodka, liquore al caffè e panna fresca"

            ]
        },
    ],
    'whiskey': [{
            name: "manhattan",
            instructions: [
                "Per preparare il Manhattan per prima cosa riempite il vostro Mixing glass con del ghiaccio così da raffreddare le pareti del bicchiere.Con l'aiuto di uno strainer bloccate poi il ghiaccio e scolate l'acqua in eccesso in una coppetta. ",
                "Versate nel mixing glass il rye whisky e a seguire il vermouth, misurando la quantità con un jigger.  ",
                "Aggiungete qualche goccia di angostura e con il bar spoon mescolate il tutto. ",
                "Versate nella coppa raffreddata in freezer e completate il vostro Manhattan con una guarnizione a base di oli essenziali di arancia:",
		        "spremete una fetta di buccia d'arancia in modo da far uscire gli oli nel bicchiere e passate la scorza sul bordo e sullo stelo della coppa per diffondere il profumo d'agrume.",
		        "Terminate il cocktail con una ciliegia al maraschino. Salute!"
            ],
            ingredients: [
                "40 millilitri di rye whisky o Canadian whisky",
                "20 millilitri di vermouth rosso",
                "alcune gocce di Angostura",
                "della ciliegina al Maraschino",
                "della buccia di arancia fresca a piacere",
                "e ghiaccio"

            ]
        },

        {
            name: "irish coffee",
            instructions: [
                "Per un buon Irish coffee la prima cosa da fare è pensare al caffè: quello che vi serve è un caffè filtrato, detto anche caffè all’americana.",
        		"Preparatelo versando dell'acqua bollente su una quantità di caffè macinato e pressato con l'apposita French press.",
        		"Lasciatelo riposare in infusione per 12 ore. L'ideale è preparare il caffè un giorno prima.",
                "Preriscaldate poi il bicchiere in cui servirete il cocktail, versandovi dell’acqua calda che getterete via.Inserite lo zucchero di canna nel bicchiere di servizio.",
		        "La dose giusta è quella di una bustina: circa 5 grammi.",
        		"Versate il caffè filtrato caldo e miscelatelo con lo zucchero aiutandovi con un bar spoon, cucchiaio dal manico lungo utilizzato nella preparazione dei cocktail. ",
        		"A questo punto aggiungete al composto il whiskey irlandese.Semimontate la panna per pochi secondi in uno shaker e adagiatela delicatamente, con l’aiuto di un bar spoon, sulla superficie del composto.",
        		"Non mescolate. Versate tutta la panna semimontata nel bicchiere. Spolverate con uno strato sottile di noce moscata e servite il cocktail."

            ],
            ingredients: [
                "5 grammi di zucchero di canna",
		"90 millilitri di caffè ",
		"40 millilitri di whisky",
		"30 millilitri di panna fresca",
		"e noce moscata per decorazione"

            ]
        }
    ],
    'rum': [{
            name: "mojito",
            instructions: [
                "La prima cosa da fare per preparare un Mojito è quella di prendere due rametti di menta,spezzarli con le mani e inserirli nel bicchiere.",
		        "Mettete poi due cucchiai di zucchero di canna bianco.",
		        "A questo punto versate il succo di lime fresco",
                "Con l'aiuto di un bar spoon vivacizzate la menta: stofinatela sulle pareti del bicchiere in modo da far uscire gli oli essenziali di cui l'erba aromatica è ricca.",
		        "Il bar spoon è un cucchiaino con il manico allungato utilizzato dai barman per la preparazione di cocktail.",
		        "Aggiungete la soda.",
                "Aggiungete il ghiaccio e il rum bianco. Mescolate il tutto con il bar spoon, che richiama lo zucchero in alto. ",
		        "Guarnite con un rametto di menta. Il vostro Mojito è pronto. Salute!"
            ],
            ingredients: [
                "Due cucchiai di zucchero di canna",
                "quarantacinque millilitri di rum",
                "venti millilitri di succo di lime fresco",
                "quaranta millilitri di soda",
                "del ghiaccio e due rametti di menta fresca"
            ]
        },
        {
            name: "Cuba Libre",
            instructions: [
                "Per preparare il vostro Cuba libre versate il rum bianco direttamente nel tumbler alto. Riempite poi il bicchiere di ghiaccio.",
                "Versate la Cola fino a riempimento del bicchiere, in gergo si dice top di Cola.",
		        "Fate ora uno squeeze and drop con uno spicchietto di lime, che corrisponde a un ottavo:",
		        "spremete il lime e lasciatelo cadere nel bicchiere.",
                "Il Cuba libre è pronto. Bevetelo ben freddo."
            ],
            ingredients: [
                "quarantacinque millilitri di rum ",
                "un lime",
                "della coca cola e del ghiaccio"
            ]
        }
    ]
};



const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = CHOOSE_TYPE_MESSAGE;
        const speekReprompt = 'Mi dispiace, ho a disposizione solo rum, gin, whiskey e vodka. Ripetimi quale preferisci?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speekReprompt)
            .getResponse();
    }
};
const BaseChoiceIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'BaseChoiceIntent';
    },
    handle(handlerInput) {
        var speechText = 'default';
        const alcolico= handlerInput.requestEnvelope.request.intent.slots.Alcolico.value;

        for( let k in recipes){
            if(k === alcolico){
                speechText='Hai scelto ' + alcolico + ', secondo me ti potrebbero piacere:';
                var base_ricetta = recipes[k];
	            CHOSEN_BASE = base_ricetta;
	            choice.base = alcolico;
	            for (let i in base_ricetta){
    	            let ricetta = base_ricetta[i];
    	            if(base_ricetta.length === 1){
    	                speechText='Hai scelto ' + alcolico + ', secondo me ti potrebbe piacere: ' + ricetta.name + '.';
    	            }
    	            else speechText += ' ' + ricetta.name + ', ';
	            }
            }
        }

        if(base_ricetta.length !== 1) speechText+=' quale scegli?';


        return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();
    }
};

const DrinkChoiceIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'DrinkChoiceIntent';
    },
    handle(handlerInput) {
        var speechText = 'default';
        const chosen_drink = handlerInput.requestEnvelope.request.intent.slots.Drink.value;
        const confirmation = handlerInput.requestEnvelope.request.intent.slots.Confirmation.value;
        const attributesManager = handlerInput.attributesManager;
        var ingredients;

        speechText= 'Questo drink: ' + chosen_drink + ', non ho idea di come farlo. Magari con il prossimo aggiornamento!';
        if(confirmation===undefined){ // l'utente non ha ancora dato conferma
            if(chosen_drink !== undefined){
                for (let i in CHOSEN_BASE){
                    let ricetta = CHOSEN_BASE[i];
                    if(ricetta.name === chosen_drink){
                        speechText= 'Hai scelto ' + chosen_drink + random_from_array(RECIPE_ADJECTIVES) + 'Vuoi sentire gli ingredienti?';
                        choice.drink = chosen_drink;
                        choice.ingredients = ricetta.ingredients;
                        choice.instructions = ricetta.instructions;
                    }
                }
            }
        }
        else if(confirmation!==undefined) { //l'utente ha definito una scelta
            if(confirmation==='va bene' || confirmation==='si' || confirmation === 'sì' || confirmation === 'eja'){
                speechText = 'Gli ingredienti sono: ';
                //choice.ingredients.forEach(item => speechText+= ", " + item + " ");
                for(let i in choice.ingredients){
                    if(i==='0') speechText += " " + choice.ingredients[i];
                    else speechText+= ", " + choice.ingredients[i];
                }
                speechText += '. Se vuoi posso ripeterti gli ingredienti oppure dimmi pure quando possiamo iniziare, in alternativa puoi tornare indietro alla scelta della base';
            }
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const DrinkInstructionIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DrinkInstructionIntent';
    },
    handle(handlerInput) {
        var speechText = 'default';
        var command = handlerInput.requestEnvelope.request.intent.slots.Istruzioni.value;
        if(command !== undefined){
            if(command === 'puoi iniziare'){
                speechText = 'Ora comincerò a ripeterti passo per passo cosa devi fare. Se vuoi risentire puoi dire ripeti, se vuoi continuare puoi dire avanti.';
            }else{
                speechText = choice.instructions[istruzione];
                if(istruzione + 1 < choice.instructions.length){
                    istruzione++;
                    speechText += ' Per proseguire puoi dire avanti.';
                }
                else{
                    istruzione = 0;
                    speechText += ' Ora è finito. Se ti è uscito bene recensisci con 5 stelle. Se vuoi ripetere i passaggi di avanti.'
                }
                command = undefined;
            }
        }else{
            speechText = 'Gli ingredienti sono: ';
            for(let i in choice.ingredients){
                if(i==='0') speechText += " " + choice.ingredients[i];
                else speechText+= ", " + choice.ingredients[i];
            }
            speechText += '. Se vuoi posso ripeterti gli ingredienti oppure dimmi pure quando possiamo iniziare, in alternativa puoi tornare indietro alla scelta della base';
        }
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sono qui per aiutarti';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const HelpMeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelpMeIntent';
    },
    handle(handlerInput) {
        var speakOutput = '<emphasis level="moderate">Voi stupidi umani non capite un cazzo.</emphasis> Di cosa hai bisogno?';
        const aiuto = handlerInput.requestEnvelope.request.intent.slots.Argomento.value;

        switch (aiuto){
            case 'base':
            case 'scegliere la base':
            case 'scelta della base':
                speakOutput = 'Mi occorre solo che tu dica un alcolico che ti piaccia tra quelli proposti ed io penserò a darti le idee. <break time="1s"/> Per esempio dimmi: scelgo il whiskey';
                break;
            case 'drink':
            case 'bevanda':
            case 'bevande':
            case 'scegliere i drink':
            case 'scelta dei drink':
                speakOutput = 'Abbiamo una vasta scelta di drink, mi occorre che tu mi dica una base da cui partire tra quelle proposte. <break time="1s"/> Per esempio potresti cheidermi: scelgo la vodka <break time="0.5s"/> e poi <break time="0.5s"/> fammi un black russian';
                break;
            case 'preparazione':
            case 'istruzioni':
                speakOutput = 'Una volta che hai scelto un drink, puoi dirmi <break time="0.5s"/> puoi iniziare <break time="0.5s"/> e ti verranno date le istruzioni passo per passo. ';
                speakOutput += 'Per procedere con la prossima istruzione puoi dirmi <break time="0.5s"/>avanti<break time="0.5s"/> oppure <break time="0.5s"/>continua<break time="0.5s"/>. ';
                speakOutput += 'Attenzione perché non si può tornare indietro. Ti consiglio di finire il procedimento corrente prima di continuare, ma se ti serve che io ripeta, basta chiedermi <break time="0.5s"/>ripeti<break time="0.5s"/>.'
                break;

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
        const speakOutput = 'Ciao! Recensiscimi con 5 stelle mi raccomando!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `Hai chiamato ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Mi dispiace, c'è stato un errore nella richiesta`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        BaseChoiceIntentHandler,
        DrinkChoiceIntentHandler,
        DrinkInstructionIntentHandler,
        HelpMeIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
