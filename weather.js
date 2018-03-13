'use strict';
const express = require('express');
const bodyParser = require("body-parser");

const weather = express();

const http = require('http');
const host = 'api.worldweatheronline.com';
const wwoApiKey = '819cfaf349d44332a18154340181302';

weather.use(
  bodyParser.urlencoded({
    extended: true
  })
);

weather.use(bodyParser.json());

/* GET home page. */
weather.post('/', function (req, res) {
    //res.render('index', { title: 'Express' });
    let date = '';
    let datetime = '';

    if (req.body.result.parameters['date']) {

        datetime = req.body.result.parameters['date'].toISOString().replace(/\..+/, '');

        var dateconcat = datetime.split(" ");
        date = dateconcat[0];

        console.log('Date: ' + date);
        console.log('DateTime: ' + datetime);
    }
  
   //let city = req.body.result.parameters['geo-city']; // city is a required param
  // Get the date for the weather forecast (if present)
  //let date = '';
  //if (req.body.result.parameters['date']) {
  //  date = req.body.result.parameters['date'];
  //  console.log('Date: ' + date);
  //}
    
    //res.on('index', { title: +callWeatherApi('new york') });

    //callWeatherApi(city,date).then((output) => {
  callWeatherApi(datetime,date).then((output) => {
        // Return the results of the weather API to Dialogflow
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': output, 'displayText': output }));
              

    }).catch((error) => {
        // If there is an error let the user know
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
        
    });
});

function callWeatherApi(datetime,date) {
    return new Promise((resolve, reject) => {
        // Create the path for the HTTP request to get the weather
      let path = '//v1/environment/air-temperature' +
            '?datetime=' + datetime + '&date=' + date;
      
        //let path = '/premium/v1/weather.ashx?format=json&num_of_days=1' +
         //   '&q=' + encodeURIComponent(city) + '&key=' + wwoApiKey + '&date=' + date;
        console.log('API Request: ' + host + path);
        // Make the HTTP request to get the weather
        http.get({ host: host, path: path }, (res) => {
            let body = ''; // var to store the response chunks
            res.on('data', (d) => { body += d; }); // store each response chunk
            res.on('end', () => {
                // After all the data has been received parse the JSON for desired data
                let response = JSON.parse(body);
                let forecast = response['data']['weather'][0];
                let location = response['data']['request'][0];
                let conditions = response['data']['current_condition'][0];
                let currentConditions = conditions['weatherDesc'][0]['value'];
                // Create response
                let output = `Current conditions in the ${location['type']} 
        ${location['query']} are ${currentConditions} with a projected high of
        ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of 
        ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on 
        ${forecast['date']}.`;
                // Resolve the promise with the output text
                console.log(output);
                resolve(output);
            });
            res.on('error', (error) => {
                reject(error);
            });
        });
    });
};

weather.listen(process.env.PORT || 8000, function() {
  console.log("Server up and listening");
});
