const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({ 'googleId': profile.id }).then(user => {
        if (user) {
            return cb(null, user);
          } else {
            // we have a new student via OAuth!
            var newUser = new User({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id
            });
            newUser.save().then(res => { return cb(null, newUser) })
            .catch(err => { return cb(err) })
          }
    }).catch(err => {
        return cb(err)
    })
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id).then(user => done(null, user))
});