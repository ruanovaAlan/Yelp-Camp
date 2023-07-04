const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground')

//Connection to mongoose
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection erro:"));
db.once("open", () => {
    console.log("Database connected");
});

//app
const app = express();

//Set engine view and path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Set the url encoded to parse the body
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => { //home page
    res.render('home')
})

app.get('/campgrounds', async (req, res) => { //Show all campgrounds
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
})

app.get('/campgrounds/new', (req, res) => { //Add new campgrounds
    res.render('campgrounds/new')
})

app.post('/campgrounds', async (req, res) => { //post a new camp to the db
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

app.get('/campgrounds/:id', async (req, res) => { //Show a specific camp
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})




app.listen(3000, () => {
    console.log("Serving in port 3000")
})