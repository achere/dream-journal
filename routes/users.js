const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');
mongoose.connect(process.env.db, { useNewUrlParser: true });
const User = require('../models/user');

router.get('/register', function(request, response) {
  if (request.user) {
    request.logout();
    request.flash('succ', 'You have been logged out');
  }
  response.render('register');
});

const isUnique = (value, {req, location, path}) => {
  return new Promise((resolve, reject) => {
    if (value.length < 5) resolve(true); //do not proceed with validation if username is less than 5 char
    User.findOne({[path]: value}, (err, user) => {
      if (err || !user) resolve(true);
      else reject(false);
    });
  });
};

router.post('/register', [
  check('username', 'Username should be at least 5 char').isLength({min: 5}),
  check('username', 'Username is already taken').custom(isUnique),
  check('password', 'Password should be at least 6 char').isLength({min: 6}),
  check('password', 'Password should contain both numbers and letters of both cases').custom(value => {
    const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])');
    return regex.test(value);
  }),
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
    let user = new User();
    user.username = request.body.username;
    user.email = request.body.email;
    bcrypt.hash(request.body.password, 10, (err, hash) => {
      if (err) console.error(err);
      user.password = hash;
      user.save(err => {
        if (err) console.error(err);
        else {
          request.flash('succ', `User ${request.body.username} created`);
          response.render('login', {username: request.body.username});
        }
      });
    });
  }
});

router.get('/login', function(request, response) {
  response.render('login');
});

router.post('/login', function(request, response, next) {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    badRequestMessage: 'Missing username or password',
    failureFlash: true
  })(request, response, next);
});

router.get('/logout', function(request, response) {
  request.logout();
  request.flash('succ', 'You are logged out');
  response.redirect('/users/login');
});

module.exports = router;