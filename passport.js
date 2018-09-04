const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
mongoose.connect(`mongodb://${process.env.dbuser}:${process.env.dbpassword}@${process.env.dburi}`, { useNewUrlParser: true });
const User = require('./models/user');

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({username: username}, (err, user) => {
        if (err || !user) return done(null, false, {message: 'User not found'});
        bcrypt.compare(password, user.password, (err, res) => {
          if (err) return done(err);
          return res ? done(null, user) : done(null, false, {message: 'Password incorrect'});
        });
      });
  }));
  
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, (err, user) => {
      return done(err, user);
    });              
  });
}