"use strict";

var passport = require('passport');

var GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.use(new GoogleStrategy({
  clientID: '444553006193-54t7ik3ukce5c8ieoq106hrto3s11c3c.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: "http://localhost:4241/auth/google/callback",
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