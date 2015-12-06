var request = require('request');

var threshold = 4;
var timezone = -5;
console.log('threshold is ' + threshold + '.');
console.log('timezone is ' + timezone + '.');

function makePrediction() {
  // Download forecast
  request.get('http://services.swpc.noaa.gov/text/3-day-forecast.txt', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var lines = body.split('\n');
      // if the 3-day forecast is above 7
      var summary = lines[8].split(/is|\(/g);
      var max = parseInt(summary[1]);
      console.log('3-day forecast max is ' + max + '.');
      if (max > threshold) {
        // get columns
        // find columns > 7
        var days = [];
        var times = [];
        for (var i=14; i<=20; i++) {
          console.log(lines[i]);
          var cols = lines[i].replace(/\([^\)]+\)/, '     ').split(/[ ]{6,}/); //
          for (var j=1; j<cols.length; j++) {
            if (parseInt(cols[j]) > threshold) {
              days.push(j-1);
              times.push((((i-14)*3)+24+timezone)%24); // UTC is 5 hours ahead of Philly
            }
          }
        }
        if (days.length > 0) {
          console.log(days);
          console.log(times);
        } else {
          console.log('no auroras for philly :(');
          process.exit();
        }
      }
      // Continue with your processing here.
    }
  });
}

// TODO: Replace with timeout to run at 8am
makePrediction();
