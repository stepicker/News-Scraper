# News-Scraper

The latest news from the MotoGP paddock: scraped from [GP One](https://www.gpone.com/en/category/motogp) and saved on a MongoDB database together with any user comments!

## How it works

The home page shows a number of headlines with a short summary, together with a link to read the full article, and one that opens a modal for users to read / leave comments.

A click on the button "Scrape the latest articles!" will do just that, updating the page with the most recent news from GP One.

## Solution

The web site is supported by a Node.js server and hosted on Heroku.

It also uses the following key NPM packages:

> 1. `Express`
> 2. `Express Handlebars`
> 3. `Mongoose`
> 4. `Cheerio`
> 5. `Axios`

## Deployed version

Check it out at [this link](http://news-picker.herokuapp.com/)!
