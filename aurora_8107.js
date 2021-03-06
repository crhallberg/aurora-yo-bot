var moment = require('moment');
var request = require('request-promise');
var schedule = require('node-schedule');

// City information
// This is for Philadelphia
var lat = 39.9;
var lng = -75.3;
var timezone = -5; // off of UTC

// Check these maps for your minimum threshold
// (imagine even numbers halfway between the lines)
// (like an 8 for New Jersey or Ireland)
// North America : http://www.softservenews.com/globeNW_big.gif
// Europe        : http://www.softservenews.com/globeNE_big.gif
var threshold = 8;

var YOAPITOKEN = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';

console.log('threshold is ' + threshold + '.');
console.log('timezone is ' + timezone + '.');

function yoMessage(msg) {
  console.log(msg);
  request.post(
    'https://api.justyo.co/yoall/',
    { form: {
      api_token: YOAPITOKEN,
      text: msg,
    } }
  );

}

function makePrediction() {
  // Download forecast
  request('http://services.swpc.noaa.gov/text/3-day-forecast.txt')
    .then(function (body) {
      var lines = body.split('\n');
      // if the 3-day forecast is above 7
      var summary = lines[8].split(/is|\(/g);
      var max = parseInt(summary[1]);
      console.log('3-day forecast max is ' + max + '.');
      if (max >= threshold) {
        // get columns
        // find columns > 7
        var days = [];
        var times = [];
        console.log(lines[13]);
        for (var i=14; i<=21; i++) {
          console.log(lines[i]);
          var cols = lines[i].replace(/\([^\)]+\)/, '     ').split(/[ ]{6,}/); //
          for (var j=1; j<cols.length; j++) {
            if (parseInt(cols[j]) >= threshold) {
              days.push(j-1);
              times.push((((i-14)*3)+24+timezone)%24); // UTC is 5 hours ahead of Philly
            }
          }
        }
        if (days.length > 0) {
          // If we have candidates, check if it's dark
          var promises = [];
          for (var i=0; i<days.length; i++) {
            var day = moment().add(days[i], 'days');
            if (day.isAfter()) {
              var p = request('http://api.sunrise-sunset.org/json?lat='+lat+'&lng='+lng+'&date='+day.format('YYYY-MM-DD')+'&formatted=0')
                .then(function(json) { return JSON.parse(json).results; });
              promises.push(p);
            }
          }
          Promise.all(promises).then(function (sunjsons) {
            var message = "";
            var minDay = 10;
            var minTime = 30;
            for (var i=0; i<sunjsons.length; i++) {
              var period = moment(times[i], 'HH').add(days[i], 'days');
              var night = moment(sunjsons[i].astronomical_twilight_end);
              var morning = moment(sunjsons[i].astronomical_twilight_begin);
              if (times[i] > 12) {
                morning.add(1, 'days');
              } else {
                night.subtract(1, 'days');
              }
              if (period.isBetween(night, morning) && days[i] < minDay && times[i] < minTime) {
                minDay = days[i];
                minTime = times[i];
                message = period.format('dddd')+' the '+period.format('Do')+', '+moment(times[i], 'HH').format('ha')+' to '+((times[i]+3)%24);
              }
            }
            if (message.length > 0) {
              console.log('---');
              yoMessage(message);
            }
          });
        } else {
          console.log('---');
          console.log('no auroras for philly :(');
        }
      } else {
        console.log('---');
        console.log('no auroras for philly :(');
      }
    });
}

makePrediction();
// Every day at 8am
schedule.scheduleJob('0 8 * * *', makePrediction);
