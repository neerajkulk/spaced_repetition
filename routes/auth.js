const express = require('express')
const router = express.Router()
const passport = require('passport')
const { ensureAuth, ensureGuest } = require('../middleware/auth');

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/quizzes',
        failureRedirect: '/',
        failureFlash: true
    })
);

router.get('/logout', ensureAuth, (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/');
});

module.exports = router