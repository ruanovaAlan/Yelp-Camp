const express = require('express');
const router = express.Router({ mergeParams: true }); //Allows us to use all params 
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/expressError');
const Campground = require("../models/campground");
const Review = require('../models/review');
const reviews = require('../controllers/review');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

//Post a review on a campground
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//Delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;