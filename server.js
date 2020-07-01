const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const Recipe = require("./models/recipe");

const app = express();

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  () => {
    console.log("Connected to db");
  }
);

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(fileUpload());

app.use(express.static("public"));

app.get("/", (req, res) => {
  Recipe.find({}, (err, detail) => {
    if (err) console.log(err);
    res.render("index", {
      detail,
    });
  }).sort({
    _id: -1,
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/recipe-list", (req, res) => {
  Recipe.find({}, (err, detail) => {
    if (err) console.log(err);
    res.render("recipe_list", {
      detail,
    });
  }).sort({
    _id: -1,
  });
});

app.get("/recipes/:id", (req, res) => {
  var id = req.params.id;

  Recipe.findById(id, (error, recipe) => {
    if (error) {
      console.log("Couldn't find recipe with that id:");
    } else {
      res.render("recipes", {
        recipe,
      });
    }
  });
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  var data = req.body;

  var imageFile = req.files.imageFile;
  console.log(imageFile);

  imageFile.mv("public/images/" + imageFile.name, (error) => {
    if (error) {
      console.log("Couldn't upload the image file");
      console.log(error);
    } else {
      console.log("Image file succesfully uploaded.");
    }
  });

  var recipe = new Recipe({
    recipeName: data.recipeName,
    author: data.author,
    ingredients: data.ingredients.split(";"),
    preparation: data.preparation.split(";"),
    additional: data.additional,
    recipeImage: imageFile.name,
  });

  recipe.save((err, detail) => {
    if (err) console.log(err);
    res.redirect("/recipe-list");
  });
});

app.get("/recipes/edit/:id", (req, res) => {
  var id = req.params.id;
  Recipe.findById(id, (error, recipe) => {
    if (error) {
      console.log("Couldn't find recipe with that id:");
    } else {
      res.render("edit", {
        recipeName: recipe.recipeName,
        author: recipe.author,
        additional: recipe.additional,
        id: id,
      });
    }
  });
});

app.post("/recipes/edit/:id", (req, res) => {
  var id = req.params.id;
  var data = req.body;

  Recipe.findByIdAndUpdate(
    id,
    {
      recipeName: data.recipeName,
      author: data.author,
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

app.get("/delete/:id", (req, res) => {
  var id = req.params.id;
  Recipe.findByIdAndDelete(id, (err, recipe) => {
    if (err) console.log(err);
    else {
      res.redirect("/recipe-list");
    }
  });
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
