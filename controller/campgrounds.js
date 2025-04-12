const Campground = require("../models/campground");
const {cloudinary} = require('../cloudinary');
const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campground/index", { campgrounds });
};

module.exports.new = (req, res) => {
  res.render("campground/new");
};

module.exports.create = async (req, res) => {
  const campground = new Campground(req.body.campground);
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  campground.geometry = geoData.features[0].geometry;
  console.log(geoData);
  // res.send(campground)
  campground.author = req.user._id;
  campground.images = req.files.map(f=>({url:f.path , filename:f.filename}));
  await campground.save();
  req.flash("success", "New Campground Added Successfully!");
  res.redirect("/campgrounds");
};

module.exports.show = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // This will populate the author field in each review
        select: "username", // We only need the username from the User model
      },
    })
    .populate("author", "username"); // Populate the campground's author

  // console.log(campground);
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campground/show", { campground });
};

module.exports.edit = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground not found!");
    return res.redirect("/campgrounds");
  }
  res.render("campground/edit", { campground });
};
module.exports.update = async (req, res) => {
  const { id } = req.params;
  console.log(req.body)
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    {new: true,runValidators: true}
  );
const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
campground.geometry = geoData.features[0].geometry;
  if(req.body.deletedImages){
    const deletePromises = req.body.deletedImages.map(filename => cloudinary.uploader.destroy(filename));
    await Promise.all(deletePromises);  // Deletes all images in parallel
    await campground.updateOne({$pull:{images:{filename:{$in:req.body.deletedImages}}}})
    console.log(campground)
  }
  const imgs = req.files.map(f=>({url:f.path , filename:f.filename}));
  campground.images.push(...imgs);
  await campground.save()
  req.flash("success", "Campground Updated Successfully!");
  res.redirect(`/campgrounds/${campground._id}`);
};
module.exports.delete = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Campground Deleted Successfully!");
  res.redirect("/campgrounds");
};
