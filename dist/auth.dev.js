"use strict";

var passport = require('passport');

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
  clientID: '444553006193-ne17qt4h6roc0o594g7jctdrc5rofpoq.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: "https://librarymits.me/auth/google/callback",
  passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
  return done(null, profile);
}));
passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (user, done) {
  done(null, user);
});