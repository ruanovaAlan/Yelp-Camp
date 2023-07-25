const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


//Show all 
router.get("/", catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

//Add new 
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

//post a new camp to the db
router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Campground created successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Show a specific camp
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews', populate: { //nested populate; populate the reviews
            path: 'author' //populate the author of the review
        }
    }).populate('author'); //populate the author of the camp
    if (!campground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", { campground });
}));

//display a page to edit a campground
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { campground });
}));

//edit a campground
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    //update edited campground into db
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true }
    );
    req.flash('success', 'Campground updated successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Delete a campground
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully!');
    res.redirect("/campgrounds");
}));

module.exports = router;