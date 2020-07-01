const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
  recipeName: String,
  author: String,
  ingredients: Array,
  preparation: Array,
  additional: String,
  recipeImage: String
})


module.exports = mongoose.model('Recipe', recipeSchema)