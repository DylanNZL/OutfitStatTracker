  // Required Files
var Outfit        = require('./outfit'),
    ps2ws         = require('./ps2ws'),
    api_key       = require('./api_key'),
    routes        = require('./routes/index'),
    users         = require('./routes/users'),
    items         = require('./items.js'),
    database      = require('./database.js'),
    bases         = require('./bases.js');
  // Required Modules
var express       = require('express'),
    path          = require('path'),
    favicon       = require('serve-favicon'),
    logger        = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser    = require('body-parser'),
    Q             = require('q');
  // Global Variables
var trackedOutfit;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


//
function getOutfit(OutfitTag) {
  // Calls a function in outfit.js to find the character data for the tracked outfit. 
  // Sends the data to ps2ws.js to track them on the streaming API
  var response = Q.defer();
  var promises = [];
  promises.push(Outfit.fetchTrackingOutfit(OutfitTag));
  Q.allSettled(promises).then(function (results) {
    console.log("Outfit: " + JSON.stringify(results[0].value));
    trackedOutfit = results[0].value;
    //ps2ws.createStream(trackedOutfit);
    return response.promise;
  });
}

function getOutfitFromID(CharacterID) {
  // calls a function in outfit.js to find a new character ids outfit/name
  Outfit.fetchOutfitFromCharacterID(CharacterID).then(function (result) {
    return result[0].value;
  });

}
  // Initialise the Item Lookup for when it is needed later (not a speedy process)  
items.initialise().then(function (result) {
  if (result) {
    console.log("Items Initialised");
  } else {
    console.error("Items did not initialise");
  }
});
  // Initialise the Base Lookup for when it is needed later (not a speedy process)
bases.initialise().then(function (result) {
  if (result) {
    console.log("Bases Initialised");
  } else {
    console.error("Bases did not initialise");
  }
});
  
getOutfitFromID("5428180936948328209");
//getOutfit("FCLM");

module.exports = app;
exports.getOutfitFromID = getOutfitFromID;