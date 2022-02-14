const Joi = require("joi");
const {hashPassword} = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const {Strategy: LocalStrategy} = require("passport-local");
const User = require("../models/user");


passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    },
    function (email, password, done) {
        User.findOne({'email': email}, async function (err, user
        ) {
            if (err) return done(err)
            if (!user) {

                return done(null, false);
            }
            const isValidPassword = await bcrypt.compare(email, user.password)
            if (isValidPassword === true) {

            }
            return done(null, user)
        })
    }
))
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, {username: user.email});
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

