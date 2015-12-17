# aurora-yo-bot
node.js based yo bot that alerts you when aurora borealous may be visible in your area

## Setup

You'll need the latitude and longitude for your target area. Code is setup for Philadelphia.
```
var lat = 39.9;
var lng = -75.3;
var timezone = -5; // off of UTC
```

You'll also need a [YO API key](https://dev.justyo.co/).
```
var YOAPITOKEN = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
```

Check these maps for your minimum threshold. You may also use even numbers if you live halfway between the lines.
- North America : http://www.softservenews.com/globeNW_big.gif
- Europe        : http://www.softservenews.com/globeNE_big.gif
```
var threshold = 8;
```
