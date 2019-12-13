/* eslint-disable  func-names */
/* eslint-disable  no-console */
const https = require('https');

const Alexa = require('ask-sdk');

const fetchNextGame = async () => {

  return new Promise((resolve, reject) => {

    httpGet('prod/v1/2019/teams/nuggets/schedule.json', (data) => {
      console.log('Requested Nuggets Data');

  
      var season = JSON.parse(data).league;
      var lastStandardGamePlayedIndex = season.lastStandardGamePlayedIndex;
      var games = season.standard;
      var nextGame = games[lastStandardGamePlayedIndex+1];//games.length - 1];

      var details = nextGame.gameUrlCode.split('/');
      var vTeam = details[1].substring(0,3);
      var hTeam = details[1].substring(3,6);

      resolve(hTeam + " playing " + vTeam);
    });

  })
};

const fetchScore = async () => {

  return new Promise((resolve, reject) => {

    httpGet('prod/v1/2019/teams/nuggets/schedule.json', (data) => {
      console.log('Requested Nuggets Data');

  
      var season = JSON.parse(data).league;
      var lastStandardGamePlayedIndex = season.lastStandardGamePlayedIndex;
      var games = season.standard;
      var lastGame = games[lastStandardGamePlayedIndex]//games.length - 1];
      var score = "Home " + lastGame.hTeam.score + " to Visiting " + lastGame.vTeam.score;
      //var score = lastGame.vTeam.score;
      resolve(score);
    });

  })
};

const fetchTodaysGames = async () => {

  return new Promise((resolve, reject) => {

    httpGet('prod/v1/20191212/scoreboard.json', (data) => {
      console.log('Requested Todays Games');

  
      var games = JSON.parse(data).games;
      
      var gamesStr = [];
      for (var i=0; i<games.length; i++) {
        let vTeam = games[i].vTeam;
        let hTeam = games[i].hTeam;
        gamesStr.push(vTeam.triCode + ' with ' + vTeam.win + '-' + vTeam.loss + ' at ' + hTeam.triCode + ' with ' + hTeam.win + '-' + hTeam.loss)
      }

      resolve(gamesStr.join(',,,'));
    });

  })
};


const GetLastScoreHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'
        && request.intent.name === 'getscore');
  },
  async handle(handlerInput) {
    
    console.log('Get Score Handler');

    const speakText = await fetchScore();

    return handlerInput.responseBuilder
      .speak(speakText)
      .withSimpleCard(SKILL_NAME, speakText)
      .getResponse();
    

  },
};


const GetNextGameHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'getnextgame');
  },
  async handle(handlerInput) {
    
    console.log('Get Next Game Handler');


    const speakText = await fetchNextGame();

    return handlerInput.responseBuilder
      .speak(speakText)
      .withSimpleCard(SKILL_NAME, speakText)
      .getResponse();
    

  },
};


const GetTodaysGamesHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (request.type === 'IntentRequest'
        && request.intent.name === 'gettodaysgames');
  },
  async handle(handlerInput) {
    
    console.log('Get Todays Games Handler');

    const speakText = await fetchTodaysGames();

    return handlerInput.responseBuilder
      .speak(speakText)
      .withSimpleCard(SKILL_NAME, speakText)
      .getResponse();
    

  },
};


const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'Space Facts';
const GET_FACT_MESSAGE = 'Here\'s your fact: ';
const HELP_MESSAGE = 'You can say tell me a space fact, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
  'A year on Mercury is just 88 days long.',
  'Despite being farther from the Sun, Venus experiences higher temperatures than Mercury.',
  'Venus rotates counter-clockwise, possibly because of a collision in the past with an asteroid.',
  'On Mars, the Sun appears about half the size as it does on Earth.',
  'Earth is the only planet not named after a god.',
  'Jupiter has the shortest day of all the planets.',
  'The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years.',
  'The Sun contains 99.86% of the mass in the Solar System.',
  'The Sun is an almost perfect sphere.',
  'A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event.',
  'Saturn radiates two and a half times more energy into space than it receives from the sun.',
  'The temperature inside the Sun can reach 15 million degrees Celsius.',
  'The Moon is moving approximately 3.8 cm away from our planet every year.',
];

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetLastScoreHandler,
    GetNextGameHandler,
    GetTodaysGamesHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();



function httpGet(query, callback) {
    // https://data.nba.net/prod/v1/2019/teams/nuggets/schedule.json
    var options = {
        host: 'data.nba.net',
        path: '/' + encodeURIComponent(query),
        method: 'GET',
    };

    var req = https.request(options, res => {
        res.setEncoding('utf8');
        var responseString = "";
        
        //accept incoming data asynchronously
        res.on('data', chunk => {
            responseString = responseString + chunk;
        });
        
        //return the data when streaming is complete
        res.on('end', () => {
            console.log(responseString);
            callback(responseString);
        });

    });
    req.end();
}