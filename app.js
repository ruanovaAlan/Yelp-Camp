const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require('./utils/expressError');
const methodOverride = require("method-override");
const session = require('express-session');
const flash = require('connect-flash')

const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


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

//Middleware
app.use((req, res, next) => { //Flash 
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


//routers
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

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
