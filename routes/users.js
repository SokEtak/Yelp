const express = require("express");
const router = express.Router({ mergeParams: true }); // For access to parent route parameters
const catchAsync = require("../utils/catchAsync");
const { storeReturnTo } = require("../middleware");
const User = require("../controller/users");
const passport = require("passport");

// Register Routes
router
  .route("/register")
  .get(User.register)
  .post(catchAsync(User.create));

// Local Authentication Middleware
const localAuthMiddleware = passport.authenticate("local", {
  failureRedirect: "/login",
  failureMessage: true,
  failureFlash: true,
});

// Login Routes
router
  .route("/login")
  .get(User.loginForm)
  .post(
    // Store the returnTo value in the session
    storeReturnTo,
    
    // Authenticate user with local strategy
    localAuthMiddleware,

    // Login user and redirect based on returnTo
    User.login
  );

// Logout Route
router.get("/logout", User.logout);

module.exports = router;
