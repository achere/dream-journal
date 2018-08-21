// init project
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator/check');

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//express-session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
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

// init sqlite db
const fs = require('fs');
const dbFile = './.data/sqlite.db';
const exists = fs.existsSync(dbFile);
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFile);

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.render('index');
});

// endpoint to get all the dreams in the database
// read the sqlite3 module docs and try to add your own! https://www.npmjs.com/package/sqlite3
app.get('/getDreams', function(request, response) {
  db.all('SELECT * from Dreams', function(err, rows) {
    response.send(JSON.stringify(rows));
  });
});

app.get('/dreams/add', function(request,response) {
  response.render('add_dream');
});

app.post('/dreams/add', [
  check('dream', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], function(request, response) {
  const errors = validationResult(request);
  if(!errors.isEmpty()) {
    console.log(errors.array());
    errors.array().forEach((err) => {
      request.flash('errr', err.msg);
    });
    response.render('add_dream', {} = request.body);
  } else {
    console.log('Adding dream:', request.body.dream);
    //db.serialize(() => {
      const insert = db.prepare('INSERT INTO Dreams (dream, description) VALUES ((?), (?))');
      insert.run([request.body.dream, request.body.description]);
    //});
    request.flash('succ', 'Dream added');
    response.redirect('/');
  }
});

app.get('/dreams/:id', function(request, response) {
  const select = db.prepare('SELECT id, dream, description FROM Dreams WHERE id=(?)');
  select.get(request.params.id, function(err, row) {
    if (err || row == undefined) {
      request.flash('errr', 'There\' no such dream');
      response.redirect('/');
    } else {
      response.render('dream', {
        dream: row.dream,
        description: row.description,
        id: row.id
      });
    }
  });
});

app.post('/dreams/:id', 
         [check('dream', 'Title is required').not().isEmpty(),
          check('description', 'Description is required').not().isEmpty()],
         function(request, response) {
  const errors = validationResult(request);
  if(!errors.isEmpty()) {
    errors.array().forEach((err) => {
      request.flash('errr', err.msg);
    });
    let viewObj = request.body;
    viewObj.id = request.params.id
    response.render('dream', viewObj);
  } else {
    const update = db.prepare(`UPDATE Dreams SET dream = (?), description = (?) WHERE id = ${request.params.id}`);
    update.run(request.body.dream, request.body.description);
    request.flash('succ', 'Dream updated');
    response.redirect(`/dreams/${request.params.id}`);
  }
});

app.delete('/dreams/:id', function(request, response) {
  console.log('deleting dream id =', request.params.id);
  //db.serialize(() => {
    db.run(`DELETE FROM Dreams WHERE id = ${request.params.id}`);
  //});
  request.flash('succ', 'Dream removed');
  response.sendStatus(200);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
