const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/expressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js'); //Not a mongoose schema
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const campground = require("./models/campground");
const Review = require('./models/review');


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


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //not a mongoose schema
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

//home page
app.get("/", (req, res) => {
    res.render("home");
});

//Show all campgrounds
app.get("/campgrounds", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

//Add new campgrounds
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

//post a new camp to the db
app.post("/campgrounds", validateCampground, catchAsync(async (req, res, next) => {
    //if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Show a specific camp
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render("campgrounds/show", { campground });
}));

//display a page to edit a campground
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
}));

//edit a campground
app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    //update edited campground into db
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true }
    );
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Delete a campground
app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

//Post a review on a campground
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Delete a review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //$pull removes a specified document from an array
    await Review.findById(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

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
