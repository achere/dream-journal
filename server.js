// init project
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//load pug views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

//passport config and middleware
require('./passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(request, response, next) {
  response.locals.user = request.user || null;
  next();
});

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.render('index');
});

// add routes from files
const dreams = require('./routes/dreams');
const users = require('./routes/users');
app.use('/dreams', dreams);
app.use('/users', users);

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});