const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();


cloudinary.config({
    cloud_name:"dtndxel5p",
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary, 
    params:{
        folder:"YelpCamp",
        allowedFormats:['jpg','jpeg','png']
    }
})

module.exports  = { cloudinary,storage }
 