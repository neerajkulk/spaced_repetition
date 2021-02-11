module.exports = {
    ensureAuth: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error', 'Please log in to view that resource');
        res.redirect('/');
    },
    ensureGuest: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        res.redirect('/quizzes');
    },
    ensureInstructor: function (req, res, next) {
        if (req.isAuthenticated() && req.user.userType === 'instructor') {
            return next()
        }
        res.redirect('/quizzes')
    },
    ensureStudent: function (req, res, next) {
        if (req.isAuthenticated() && req.user.userType === 'student') {
            return next()
        }
        res.redirect('/quizzes')
    }
};