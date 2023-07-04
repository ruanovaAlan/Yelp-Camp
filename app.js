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

app.get('/', (req, res) => { //home page
    res.render('home')
})

app.get('/makecampground', async (req, res) => {
    const camp = new Campground({ title: 'My backyard', description: 'Cheap' });
    await camp.save();
    res.send(camp)
})


app.listen(3000, () => {
    console.log("Serving in port 3000")
})