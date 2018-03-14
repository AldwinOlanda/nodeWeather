﻿'use strict';
const express = require('express');
const bodyParser = require("body-parser");

const weather = express();

const https = require('https');
const host = 'api.data.gov.sg';
//const host = 'api.worldweatheronline.com';
//const wwoApiKey = '819cfaf349d44332a18154340181302';

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

    /* Check if the Datetime parameter exist */
    if (req.body.result.parameters['datetime']) {
        /* Include time inside the datetime parameter */
        datetime = req.body.result.parameters['datetime']+'T12:00:00';
        date  = req.body.result.parameters['datetime'];
    }
  /* execute the callWeatherAPI function   */
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
      let path = '/v1/environment/2-hour-weather-forecast' +
            '?date_time=' + encodeURIComponent(datetime) + '&date=' + date;
             console.log('API Request: ' + host + path);
      
         //res.setHeader('Content-Type', 'application/json');
         //res.send(JSON.stringify({ 'speech': host, 'displayText': path }));
         //return 
      
        // Make the HTTP request to get the weather
        https.get({ host: host, path: path }, (res) => {
            let body = ''; // var to store the response chunks
            res.on('items', (d) => { body += d; }); // store each response chunk
            res.on('end', () => {
                // After all the data has been received parse the JSON for desired data
                let response = JSON.parse(body);
                let items = response.items;
                let forecasts = [];
                forecasts = items[0]['forecasts'];
              
                let i = 0;
                let output = '';
                for (i = 0; i != forecasts.length; i++) {
                    output = output + `${forecasts[i]['area']} +' - '+ ${forecasts[i]['forecast']} +'\n'`;
                }
              
                //let forecast = response['items']['forecasts'][0];
                //let location = response['items']['forecasts'][0];
                //let conditions = response['data']['current_condition'][0];
                //let currentConditions = conditions['weatherDesc'][0]['value'];
                // Create response
                //let output = `Current conditions in the ${location['type']} 
        //${location['query']} are ${currentConditions} with a projected high of
        //${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of 
        //${forecast['mintempC']}°C or ${forecast['mintempF']}°F on 
        //${forecast['date']}.`;
              //let output = `Current condition in ${location['name']} with a ${forecast['forecast']}°C .`;
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
