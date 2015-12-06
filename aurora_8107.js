var request = require('request-promise');
var moment = require('moment');

var threshold = 4;
var timezone = -5;
console.log('threshold is ' + threshold + '.');
console.log('timezone is ' + timezone + '.');

function makePrediction() {
  // Download forecast
  request('http://services.swpc.noaa.gov/text/3-day-forecast.txt')
    .then(function (body) {
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
        for (var i=14; i<=21; i++) {
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
          // If we have candidates, check if it's dark
          var promises = [];
          for (var i=0; i<days.length; i++) {
            var day = moment().add(days[i], 'days').format('YYYY-MM-DD');
            var p = request('http://api.sunrise-sunset.org/json?lat=39.9&lng=-75.3&date='+day+'&formatted=0')
              .then(function(json) { return JSON.parse(json).results; });
            promises.push(p);
          }
          Promise.all(promises).then(function (sunjsons) {
            var message = "";
            for (var i=0; i<sunjsons.length; i++) {
              var period = moment(times[i], 'HH').add(days[i], 'days');
              var night = moment(sunjsons[i].astronomical_twilight_end);
              var morning = moment(sunjsons[i].astronomical_twilight_begin);
              if (times[i] > 12) {
                morning.add(1, 'days');
              } else {
                night.subtract(1, 'days');
              }
              if (period.isBetween(night, morning)) {
                message += period.format('dddd')+' the '+period.format('Do')+' from '+times[i]+' to '+((times[i]+3)%24)+'\n';
              }
            }
            if (message.length > 0) {
              console.log('---');
              console.log(message);
            }
            process.exit();
          });
        } else {
          console.log('---');
          console.log('no auroras for philly :(');
          process.exit();
        }
      }
    });
}

// TODO: Replace with timeout to run at 8am
makePrediction();
