const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator/check');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./.data/sqlite.db');
const bcrypt = require('bcryptjs');

router.get('/register', function(request, response) {
  response.render('register');
});

const isUnique = (value, {req, location, path}) => {
  return new Promise((resolve, reject) => {
    if (!value) resolve(true); //do not proceed with validation if username is empty
    const select = db.prepare(`SELECT ${path} FROM Users WHERE ${path}=(?)`);
    select.get(value, (err, row) => {
      if (err) reject(err);
      resolve(!row);
    });
  })
};

router.post('/register', [
  check('username', 'Username should not be empty').not().isEmpty(),
  check('username', 'Username is already taken').custom(isUnique),
  check('password', 'Password should not be empty').not().isEmpty(),
  check('password2', 'Confirm password should not be empty').not().isEmpty(),
  check('password2', 'Passwords should match').custom((value, {req}) => value === req.body.password),
  check('email', 'Email is not valid').isEmail(),
  check('email', 'Email is already taken').custom(isUnique)
], function(request, response) {
  const errors = validationResult(request);
  if(!errors.isEmpty()) {
    errors.array().forEach((err) => {
      request.flash('errr', err.msg);
    });
    response.render('register', {} = request.body);
  } else {
    const insert = db.prepare('INSERT INTO Users (username, password, email) VALUES (?, ?, ?)');
    bcrypt.hash(request.body.password, 10, function(err, hash) {
      if (err) console.error(err);
      console.log('Adding user ', request.body.username);
      insert.run([request.body.username, hash, request.body.email]);
      request.flash('succ', `User '${request.body.username}' created`);
      response.render('login', {username: request.body.username});
    });
  }
});

router.get('/login', function(request, response) {
  response.render('login');
});

const validateUN = (value) => {
  return new Promise((resolve, reject) => {
    if (!value) resolve(true); //not proceed with validation if username is empty
    const select = db.prepare('SELECT username FROM Users WHERE username=(?)');
    select.get(value, (err, row) => {
      if (err) reject(err);
      if (row) resolve(true);
      else reject(false);
    });
  });
}
const validatePW = (value, {req}) => {
  return new Promise((resolve, reject) => {
    if (!req.body.username) resolve(true); //not proceed with validation if username is empty
    const select = db.prepare('SELECT password FROM Users WHERE username=(?)');
    select.get(req.body.username, (err, row) => {
      if (err) reject(err);
      if (!row) resolve(true); //not proceed with validation if no result from query
      else resolve(row);
    });
  }).then((result) => {
    if (result === true) return true; //catching resolve(true) from previous promise body and passing check
    return bcrypt.compare(value, result.password).then((res) => {
      return res;
    });
  });
};

router.post('/login', [
  check('username', 'Username should not be empty').not().isEmpty(),
  check('username', 'Username not found').custom(validateUN),
  check('password', 'Password should not be empty').not().isEmpty(),
  check('password', 'Password is incorrect').custom(validatePW)
], function(request, response) {
  const errors = validationResult(request);
  if(!errors.isEmpty()) {
    errors.array().forEach((err) => {
      request.flash('errr', err.msg);
    });
    response.render('login', {username: request.body.username});
  } else {
    request.flash('succ', 'Login successful');
    response.redirect('/');
  }
});

module.exports = router;