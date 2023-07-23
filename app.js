const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/expressError');
const methodOverride = require("method-override");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');


//Connection to mongoose
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection erro:"));
db.once("open", () => {
    console.log("Database connected");
});

//app
const app = express();

//Set engine view and path
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


//Set the url encoded to parse the body
app.use(express.urlencoded({ extended: true }));
//Set the update route
app.use(methodOverride("_method"));
//Set the route for the public directory
app.use(express.static(path.join(__dirname, 'public')));
//session
const sessionConfig = {
    secret: 'thisShouldBeSecret',
    resave: false, //erase deprecation warning 
    saveUninitialized: true, //erase deprecation warning 
    cookie: { //especify options for cookies
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //miliseconds, seconds, hours, hours-per-day, days-week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
//flash 
app.use(flash());
//passport
app.use(passport.initialize());
app.use(passport.session()); //this line needs to be below "app.use(session(sessionConfig))"
passport.use(new passportLocal(User.authenticate())); //Tell passport we want to use a local strategy and 
// for this strategy we want to authenticate User
passport.serializeUser(User.serializeUser()); //how do we store data in session
passport.deserializeUser(User.deserializeUser()); //how do we get a user out of the serialization

//Middleware
app.use((req, res, next) => { //Flash 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//routers
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

//home page
app.get("/", (req, res) => {
    res.render("home");
});





app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh NO, Something went wrong';
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log("Serving in port 3000");
});
