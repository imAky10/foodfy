const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const moment = require("moment");

const { ensureAuthenticated } = require("../config/auth");

const User = require("../models/user");
const Recipe = require("../models/recipe");
const Avatar = require("../models/avatar");

router.get("/register", (req, res) => {
  res.render("user/register");
});

router.get("/login", (req, res) => {
  res.render("user/login");
});

// Register
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({
      msg: "Please enter all fields",
    });
  }

  if (password != password2) {
    errors.push({
      msg: "Passwords do not match",
    });
  }

  if (password.length < 6) {
    errors.push({
      msg: "Password must be at least 6 characters",
    });
  }

  if (errors.length > 0) {
    res.render("user/register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({
      email: email,
    }).then((user) => {
      if (user) {
        errors.push({
          msg: "Email already exists",
        });
        res.render("user/register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then((user) => {
                req.flash(
                  "success_msg",
                  "You are now registered and can log in"
                );
                res.redirect("/user/login");
              })
              .catch((err) => console.log(err));
          });
        });
      }
    });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/user/profile",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/user/login");
});

router.get("/profile", ensureAuthenticated, async (req, res) => {
  try {
    const avatar = await Avatar.find({
      user: req.user.id,
    }).populate("user");

    const recipes = await Recipe.find({
      user: req.user.id,
    })
      .populate("user")
      .sort({
        createdAt: "desc",
      });

    res.render("user/profile", {
      user: req.user,
      recipes,
      avatar,
      moment: moment,
    });
  } catch (err) {
    console.error(err);
  }
});

router.get("/settings", ensureAuthenticated, async (req, res) => {
  const avatar = await Avatar.find({
    user: req.user.id,
  }).populate("user");

  await User.find({
    user: req.user.id,
  }),
    res.render("user/settings", {
      user: req.user,
      name: req.user.name,
      avatar,
    });
});

router.post("/settings", (req, res) => {
  User.findByIdAndUpdate(
    {
      _id: req.user.id,
    },
    {
      name: req.body.name,
      email: req.body.email,
    },
    (err, user) => {
      if (err) throw err;
      res.redirect("/user/profile");
    }
  );
});

router.get("/settings/change-password", ensureAuthenticated, (req, res) => {
  res.render("user/changePassword");
});

router.post("/settings/change-password", (req, res) => {
  let oldPassword = req.body.oldPassword;
  let newPassword = req.body.newPassword;
  let newPassword2 = req.body.newPassword2;
  User.findOne(
    {
      email: req.user.email,
    },
    (err, user) => {
      if (user != null) {
        let hash = user.password;
        bcrypt.compare(oldPassword, hash, (err, resp) => {
          if (resp) {
            if (newPassword == newPassword2) {
              bcrypt.hash(newPassword, 3, (err, hash) => {
                user.password = hash;
                user
                  .save()
                  .then((user) => {
                    req.logout();
                    req.flash(
                      "success_msg",
                      "Your password is changed. Login with new password. "
                    );
                    res.redirect("/user/login");
                  })
                  .catch((err) => console.log(err));
              });
            }
          }
        });
      }
    }
  );
});

router.post("/profile", (req, res) => {
  let imageFile = req.files.imageFile;

  imageFile.mv("public/images/avatar/" + imageFile.name, (error) => {
    if (error) {
      console.log(error);
      console.log("not uploaded");
    } else {
      console.log("Image file succesfully uploaded.");
    }
  });
  var avatar = new Avatar({
    avatarImage: imageFile.name,
    user: req.user.id,
  });

  avatar
    .save()
    .then((avatar) => {
      res.redirect("/user/profile");
    })
    .catch((err) => console.log(err));
});

router.get("/delete/avatar/:id", async (req, res) => {
  var id = req.params.id;
  await Avatar.findByIdAndDelete(id);

  res.redirect("/user/profile");
});

module.exports = router;
