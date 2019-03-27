require('dotenv').config();

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = process.env.PORT || 3000;

var app = express();
app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set the static folder
app.use(express.static("public"));

// Set up Handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


// ROUTES
// ------------------------------------

// Route to scrape the latest news
app.get("/scrape", function(req, res) {

  axios.get("https://www.gpone.com/en/category/motogp").then(function(response) {

    var $ = cheerio.load(response.data);
    $("h1.field-content.title").each(function(i, element) {
      var result = {};
      result.title = $(element).children().text();
      result.summary = $(element).parent().next().children().text();
      result.link = "https://www.gpone.com" + $(element).find("a").attr("href");
  
      // Save the result in the DB
      db.Article.create(result)
        .then(function(dbArticles) {
          console.log(dbArticles);
        })
        .catch(function(err) {
          return res.json(err);
      });

    });
    res.redirect("/");
  })
  .catch(function(err) {
    return res.json(err);
  });

});

// Home route that gets all articles from the DB
app.get('/', function (req, res) {

  db.Article.find({}).sort({_id: -1})
    .then(function(dbArticles) {
      res.render("index", {dbArticles});
    })
    .catch(function(err) {
      res.json(err);
    });

});

// Route to get all comments for a specific article
app.get("/comments/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id })
    .populate("comments")
    .then(function(dbSingleArticle) {
      console.log("Db Single Article: ", dbSingleArticle);
      res.json(dbSingleArticle);
    })
    .catch(function(err) {
      res.json(err);
    });

});

// Route to save a new comment for a specific article
app.post("/submitcomment/:id", function(req, res) {

  db.Comment.create(req.body)
    .then(function(dbComment) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbComment._id } }, { new: true });
    })
    .then(function(dbSingleArticle) {
      console.log("Db Single Article: ", dbSingleArticle);
      res.json(dbSingleArticle);
    })
    .catch(function(err) {
      res.json(err);
    });

});

// Route to delete a comment
app.get("/deletecomment/:id", function(req,res) {

  db.Comment.deleteOne({ _id: req.params.id })
  .then(function(dbComment) {
    res.json(dbComment);
  })
  .catch(function(err) {
    res.json(err);
  });

});

// Route to delete an article
app.get("/deletearticle/:id", function(req,res) {

  db.Article.deleteOne({ _id: req.params.id })
  .then(function(dbArticle) {
    res.json(dbArticle);
    console.log("Success! Updated DB: ", dbArticle);
  })
  .catch(function(err) {
    res.json(err);
    console.log("Error: ", err);
  });

});

// Route to delete all articles
app.get("/deleteallarticles", function(req,res) {

  db.Article.deleteMany({ })
  .then(function(dbArticle) {
    res.json(dbArticle);
    console.log("Success! Updated DB: ", dbArticle);
  })
  .catch(function(err) {
    res.json(err);
    console.log("Error: ", err);
  });

});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});