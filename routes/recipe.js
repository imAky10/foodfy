const express = require("express");
const router = express.Router();
const Recipe = require("../models/recipe");
const Avatar = require("../models/avatar");

const { ensureAuthenticated } = require("../config/auth");

// Home page
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find({
      status: "public",
    })
      .populate("user")
      .sort({
        createdAt: "desc",
      });

    res.render("recipes/index", {
      recipes,
    });
  } catch (err) {
    console.error(err);
  }
});

// About page
router.get("/about", (req, res) => {
  res.render("about");
});

// My recipes
router.get("/recipe-list", ensureAuthenticated, async (req, res) => {
  try {
    const recipes = await Recipe.find({
      user: req.user.id,
      status: "public",
    })
      .populate("user")
      .sort({
        createdAt: "desc",
      });

    res.render("recipes/recipe_list", {
      recipes,
    });
  } catch (err) {
    console.error(err);
  }
});

// Recipe detail
router.get("/recipes/:id", async (req, res) => {
  var id = req.params.id;
  const avatar = await Avatar.find({
    user: req.user,
  }).populate("user");

  const recipe = await Recipe.findById(id).populate("user");

  res.render("recipes/recipes", {
    recipe,
    avatar,
  });
});

// Add recipe page
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("recipes/add", {
    user: req.user,
  });
});

// Add recipe
router.post("/add", (req, res) => {
  var imageFile = req.files.imageFile;

  imageFile.mv("public/images/" + imageFile.name, (error) => {
    if (error) {
      console.log("Couldn't upload the image file");
      console.log(error);
    } else {
      console.log("Image file succesfully uploaded.");
    }
  });

  var recipe = new Recipe({
    recipeName: req.body.recipeName,
    user: req.user.id,
    ingredients: req.body.ingredients.split(";"),
    preparation: req.body.preparation.split(";"),
    additional: req.body.additional,
    recipeImage: imageFile.name,
  });

  recipe.save((err, recipe) => {
    if (err) console.log(err);
    res.redirect("/recipe-list");
  });
});

// Edit recipe page
router.get("/recipes/edit/:id", (req, res) => {
  var id = req.params.id;
  Recipe.findById(id, (error, recipe) => {
    if (error) {
      console.log("Couldn't find recipe with that id:");
    } else {
      res.render("recipes/edit", {
        recipeName: recipe.recipeName,
        additional: recipe.additional,
        id: id,
      });
    }
  });
});

// edit recipe
router.post("/recipes/edit/:id", (req, res) => {
  var id = req.params.id;
  var data = req.body;

  Recipe.findByIdAndUpdate(
    id,
    {
      recipeName: data.recipeName,
      additional: data.additional,
    },
    (err, recipe) => {
      if (err) console.log(err);
      else {
        res.redirect("/recipe-list");
      }
    }
  );
});

// delete recipe
router.get("/delete/:id", (req, res) => {
  var id = req.params.id;
  Recipe.findByIdAndDelete(id, (err, recipe) => {
    if (err) console.log(err);
    else {
      res.redirect("/recipe-list");
    }
  });
});

// search recipe
router.get("/search", async (req, res) => {
  var data = req.query.searchRecipe;
  try {
    const recipes = await Recipe.find({
      recipeName: {
        $regex: data,
        $options: "i",
      },
    })
      .populate("user")
      .sort({
        createdAt: "desc",
      });
    res.render("recipes/search", {
      recipes,
    });
  } catch (error) {
    console.log(err);
  }
});

router.get("/recipes/user/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const recipes = await Recipe.find({
      user: req.params.userId,
      status: "public",
    }).populate("user");

    res.render("recipes/recipe_list", {
      recipes,
    });
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
