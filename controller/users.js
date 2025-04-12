const User = require("../models/user");

module.exports.register = (req, res) => {
  res.render("users/register");
};
module.exports.create = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    console.log(password);
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      console.log(registeredUser);
      req.flash("success", "Welcome to our YelpCamp");
      return res.redirect("/campgrounds");
    });
  } catch (error) {
    req.flash(
      "error",
      "This username already exist.Please try another username!!"
    );
    return res.redirect("/register");
  }
};
module.exports.loginForm = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.returnTo || "/campgrounds"; // update this line to use res.locals.returnTo now
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err); // Handle logout error
    }
    // Clear the returnTo session value after logout
    const redirectUrl = req.session.returnTo || "/"; // Default to home page if no returnTo
    delete req.session.returnTo;
    req.flash("success", "Signed out");
    res.redirect(redirectUrl); // Redirect to the saved URL or fallback URL
  });
};
