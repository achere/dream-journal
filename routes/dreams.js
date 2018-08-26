const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator/check');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');

router.get('/add', function(request,response) {
  response.render('add_dream');
});

router.post('/add', [
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
    const insert = db.prepare('INSERT INTO Dreams (dream, description) VALUES (?, ?)');
    insert.run([request.body.dream, request.body.description]);
    request.flash('succ', 'Dream added');
    response.redirect('/');
  }
});

router.get('/:id', function(request, response) {
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

router.post('/:id', 
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

router.delete('/:id', function(request, response) {
  console.log('Deleting dream id =', request.params.id);
  db.run(`DELETE FROM Dreams WHERE id = ${request.params.id}`);
  request.flash('succ', 'Dream removed');
  response.sendStatus(200);
});

module.exports = router;