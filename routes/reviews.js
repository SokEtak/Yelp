const express = require("express");
const router = express.Router({ mergeParams: true }); // For access to parent route parameters
const catchAsync = require("../utils/catchAsync.js");
const {isLoggedIn,validateReview} = require('../middleware.js')
const Reviews = require('../controller/reviews.js')

// Add a new review
router.post("/",isLoggedIn,validateReview,catchAsync(Reviews.create));

// Delete a review
router.delete("/:reviewId",catchAsync(Reviews.delete));

module.exports = router;
