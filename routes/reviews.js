const express = require('express');
const router = express.Router({ mergeParams: true }); //Allows us to use all params
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expressError');
const Campground = require("../models/campground");
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js'); //Not a mongoose schema


//middleware
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


//Post a review on a campground
router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

//Delete a review
router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //$pull removes a specified document from an array
    await Review.findById(reviewId);
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;