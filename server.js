require('dotenv').config();

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
var PORT = 3000;

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

// Home route
app.get('/', function (req, res) {

  db.Article.find({})
    .then(function(dbArticle) {
      res.render("index", {dbArticle});
    })
    .catch(function(err) {
      res.json(err);
    });

});

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
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
      });

    });

    res.redirect("/");

  });
});

// Route to get all articles from the DB
app.get("/articles", function(req, res) {

  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route to get a specific Article by ID and add a comment to it
app.get("/articles/:id", function(req, res) {

  db.Article.findOne({ _id: req.params.id })
    .populate("comment")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route to save or update a comment
app.post("/articles/:id", function(req, res) {

  db.Comment.create(req.body)
    .then(function(dbComment) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbComment._id } }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});