
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });


//var GoogleStrategy = require('passport-google-oauth20').Strategy;
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import  passport  from 'passport';

import User from '../model/user.js'


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/login/callback"
  },
 async  function(accessToken, refreshToken, profile, cb) {
    const user = await User.findOne({ googleId: profile.id });
  if (user) return cb(null, user);

  const created = await User.create({
    name: profile.displayName ?? 'Google User',
    googleId: profile.id,
    provider: 'google',
    email: profile.emails?.[0]?.value ?? `${profile.id}@google.local`,
    role: 'user' // Default role for new Google users
  });
  return cb(null, created);
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
