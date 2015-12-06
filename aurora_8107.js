var request = require('request');

function makePrediction() {
  // Download forecast
  request.get('http://services.swpc.noaa.gov/text/3-day-forecast.txt', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      // Continue with your processing here.
    }
  });
}

// TODO: Replace with timeout to run at 8am
makePrediction();