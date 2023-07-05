const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground')

//Connection to mongoose
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection erro:"));
db.once("open", () => {
    console.log("Database connected");
});

//Function to generate a random number based on an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

//function to delete and create a random 50 camps, then save to the db
const seedDb = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*20 + 10);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit, a consequatur. Expedita possimus, quos, at, eveniet officia ut impedit harum iste distinctio dolores excepturi placeat? Error beatae veritatis tempore vel.',
            price: price,
        })
        await camp.save()
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})