require('dotenv').config()
const cloudinary=require('cloudinary').v2
cloudinary.config({
    cloud_name:`dcthzdphw`,
    api_key:  `366423433212929`,
    api_secret:`D9tZNQDL8JfeLlm4EFg6YdUE4Vc`,
})
module.exports={cloudinary}