const path = require('path');
const express = require('express')
const passport = require('passport')
const flash = require('connect-flash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const session = require('express-session')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')(session);


// Load Config
dotenv.config({ path: './config/config.env' })

require('./config/passport')(passport)

connectDB()

const app = express()
app.set('view engine', 'ejs');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Express Sessions
app.use(cookieParser('secret'))
app.use(session({
    secret: 'SECRET2983749723409723490712394579234719023742734719374',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 365 * 24 * 60 * 60 },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use(flash());

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

app.use(express.static(path.join(__dirname, 'public')))

app.use(require('./routes/auth'));
app.use(require('./routes/app'));

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server running on PORT: ${PORT}. Visit http://localhost:${PORT}`))