const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose
  .connect("mongodb://127.0.0.1:27017/YelpCamp")
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Connection error:", err));

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const price = Math.floor((Math.random()*20)+10)

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author:'67d1193b8330934c2056bf2b',
      geometry:{
        type:"Point",
        coordinates:[
          cities[random1000].longitude,
          cities[random1000].latitude
        ]
      },
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: 'https://res.cloudinary.com/dtndxel5p/image/upload/v1742445644/YelpCamp/d4m3de26bm4vxse9mx5k.png',
          filename: 'YelpCamp/mfitzgfo4jbyxwsnk7eb',        
        },
        {
          url: 'https://res.cloudinary.com/dtndxel5p/image/upload/v1742444560/YelpCamp/msg2dfmuhrm19cibcxqt.png',
          filename: 'YelpCamp/mfitzgfo4jbyxwsnk7eb',        
        },
        {
          url: 'https://res.cloudinary.com/dtndxel5p/image/upload/v1742442857/YelpCamp/hegbqwr6wbmkf0zzcyae.jpg',
          filename: 'YelpCamp/ha7bmu9yxeabnmriffu1',    
        }
      ],
      description:
        "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate veritatis, esse eius cupiditate ratione libero labore quod atque magni tempora facere! Repellat expedita magni soluta esse quis optio molestias similique!",
      price:price
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
