const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    //campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //make an array 
    if (req.files && req.files.length > 0) {
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    } else {
        // If no images are provided, add the default image
        campground.images = [{ url: 'https://res.cloudinary.com/dmt9srumx/image/upload/v1691437689/YelpCamp/default_mhzpvl.jpg', filename: 'default_mhzpvl.jpg' }];
    }
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'Campground created successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground not found!');
        res.redirect('/campgrounds');
    }
    res.render("campgrounds/edit", { campground });
}

module.exports.updateCampground = async (req, res) => {
    //update edited campground into db
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { new: true }
    );
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images);
    await campground.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Campground updated successfully!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampgrounds = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted successfully!');
    res.redirect("/campgrounds");
}