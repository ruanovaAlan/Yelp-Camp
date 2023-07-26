const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const campgrounds = require('../controllers/campgrounds')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');


//Show all 
router.get("/", catchAsync(campgrounds.index));

//Add new 
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

//post a new camp to the db
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//Show a specific camp
router.get("/:id", catchAsync(campgrounds.showCampground));

//display a page to edit a campground
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//edit a campground
router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

//Delete a campground
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds));

module.exports = router;