const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/User');


module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function (username, password, done) {
        User.findOne({ email: username }, function (err, user) {
            if (err) { return done(err) }
            if (!user) {
                return done(null, false, { message: 'Email is not registered' });
            }
            if (!bcrypt.compareSync(password, user.passwordHash)) {
                return done(null, false, { message: 'Incorrect password.' })
            }
            return done(null, user)
        })
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

}

