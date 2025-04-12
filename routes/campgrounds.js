const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware");
const campgrounds = require("../controller/campgrounds");
const multer  = require('multer')
const {storage} = require('../cloudinary')
const upload = multer({storage})

// Campgrounds Routes
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(isLoggedIn, upload.array('image'),validateCampground,catchAsync(campgrounds.create));

router
  .get("/new", isLoggedIn, catchAsync(campgrounds.new));

router
  .route("/:id")
  .get(catchAsync(campgrounds.show))
  .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.update))
  .delete(isLoggedIn, catchAsync(campgrounds.delete));

router
  .get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.edit));

module.exports = router;