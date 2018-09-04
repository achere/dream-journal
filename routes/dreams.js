const express = require('express');
const router = express.Router();
const session = require('express-session');
const flash = require('connect-flash');
const { check, validationResult } = require('express-validator/check');
const mongoose = require('mongoose');
mongoose.connect(process.env.db,
  { useNewUrlParser: true });
const Dream = require('../models/dream');
const datetimes = require('../resources/datetimes');

const ensureAuth = function(request, response, next) {
  if (request.isAuthenticated()) {
    return next();
  } else {
    request.flash('errr', 'Please login');
    response.redirect('/users/login');
  }
};

const cloneDream = (obj, dream) => {
  dream.title = obj.body.title;
  dream.description = obj.body.description;
  dream.date = datetimes.stringToDate(obj.body.date);
  dream.timesince = datetimes.timeToInt(obj.body.timesince);
  dream.timeuntil = datetimes.timeToInt(obj.body.timeuntil);
  dream.lucid = !(obj.body.lucidity === 'none');
  dream.lucidity= obj.body.lucidity;
  if (obj.body.setting) dream.setting = obj.body.setting;
  dream.author = obj.user._id;
  console.log(dream)
  return dream;
}

router.get('/', ensureAuth, function(request, response) {
  Dream.find({author: request.user._id}, (err, dreams) => {
    const dreamMap = dreams.map(dream => {
      const newDream = Object.assign({}, dream._doc);
      newDream.date = datetimes.dateToString(dream.date);
      newDream.timesince = datetimes.intToTime(dream.timesince);
      newDream.timeuntil = datetimes.intToTime(dream.timeuntil);
      return newDream;
    });
    response.send(dreamMap);
  });
});

router.get('/add', ensureAuth, function(request,response) {
  response.render('add_dream');
});

router.post('/add', ensureAuth, [
  check('title', 'Title is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('timesince', 'TimeSince is required').not().isEmpty(),
  check('timeuntil', 'TimeUntil is required').not().isEmpty(),
  check('lucidity', 'Lucidity is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], function(request, response) {
  const errors = validationResult(request);
  if(!errors.isEmpty()) {
    errors.array().forEach((err) => {
      request.flash('errr', err.msg);
    });
    response.render('add_dream', {} = request.body);
  } else {
    console.log('Adding dream:', request.body.title);
    let dream = new Dream();
    cloneDream(request, dream).save(err => {
      if (err) console.error(err);
      else {
        request.flash('succ', 'Dream added');
        response.redirect('/');
      }
    });
  }
});

router.get('/:id', ensureAuth, function(request, response) {
  new Promise((resolve, reject) => {
    Dream.findById(request.params.id, (err, dream) => {
      if (err || !dream) {
        reject('Dream not found');
      } else if (dream.author != request.user._id) {
        reject('You are not authorized to view this dream');
      } else {
        resolve(dream);
      }
    });
  }).then(dream => {
    let viewObj = Object.assign({}, dream._doc);
    viewObj.date = datetimes.dateToString(dream.date);
    viewObj.timesince = datetimes.intToTime(dream.timesince);
    viewObj.timeuntil = datetimes.intToTime(dream.timeuntil);
    response.render('dream', viewObj);
  }).catch(err => {
    request.flash('errr', err);
    response.redirect('/');
  });
});

router.post('/:id', ensureAuth,[
  check('title', 'Title is required').not().isEmpty(),
  check('date', 'Date is required').not().isEmpty(),
  check('timesince', 'TimeSince is required').not().isEmpty(),
  check('timeuntil', 'TimeUntil is required').not().isEmpty(),
  check('lucidity', 'Lucidity is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], function(request, response) {
  const errors = validationResult(request);
  if(!errors.isEmpty()) {
    errors.array().forEach((err) => {
      request.flash('errr', err.msg);
    });
    let viewObj = request.body;
    viewObj.id = request.params.id
    response.render('dream', viewObj);
  } else {
    let dream = {};
    Dream.updateOne({_id: request.params.id},
                    {$set: cloneDream(request, dream)},
                    err => {
      if (err) console.error(err);
      else {
        request.flash('succ', 'Dream updated');
        response.redirect(`/dreams/${request.params.id}`);
      }
    });
  }
});

router.delete('/:id', function(request, response) {
  console.log('Deleting dream id =', request.params.id);
  Dream.findById(request.params.id, (err, dream) => {
    dream.remove({_id: request.params.id}, err => {
      if (err) console.error(err);
      else {
        request.flash('succ', 'Dream removed');
        response.sendStatus(200);
      }
    });
  });
});

module.exports = router;