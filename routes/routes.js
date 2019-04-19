const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = (app) => {
	// primary route
	app.get("/", (request, response) => {
		// query MongoDB to find all articles
		db.Article.find({})
		.sort({timestamp: -1}).then((articledb) => {
			if (dbArticle.length === 0) {
				console.log("DB empty. Try scraping again.");
				response.render("index");
			} else {
				console.log("Articles found, redirecting...")
				response.redirect("/articles");
			}
		}).catch((error) => {
			response.json(error);
		});
	});

	app.get("/clipped", (request, response) => {
		db.Article.find({ clipped:true })
		.then((articledb) => {
			let artObj = {article: articledb};
			response.render("clipped", artObj);
		}).catch((error) => {
			response.json(error);
		}); 
	});

	app.get("/scraper", (request, response)=> {
		axios.get("https://jalopnik.com/")
		.then((result)=> {
			let $ = cheerio.load(result.data);

			$(".post-item-frontpage").each(function(i, element){
				let resObj = {};
				const title = $(this).children("header").children("h1").children("a").text();
				const link = $(this).children("header").children("h1").children("a").attr("href");
				const boilerplate = $(this).children("div").children("p").text();
				const author = $(this).children("header").children("div").children("a").text();

				resObj.title = title;
				resObj.link = link;
				resObj.boilerplate = boilerplate;
				resObj.author = author;

				db.Article.create(resObj)
				.then((articledb) => {
					console.log(`\n item scraped: ${articledb}`);
				}).catch((err) => {
					console.log(`\n db save throw err: ${err}`);
				});
			});
			response.redirect("/articles");
		}).catch((error) => {
			console.log(`\n url get throw err: ${error}`);
		})
	})
}