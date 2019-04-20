// init npm pkgs
const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = (app) => {
	// primary route
	app.get("/", (request, response) => {
		// query MongoDB to find all articles
		db.Article.find({})
		.sort({timestamp: -1}).then((articledb) => {
			if (articledb.length === 0) {
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

// get all clipped articles
	app.get("/clipped", (request, response) => {
		db.Article.find({ clipped:true })
		.then((articledb) => {
			let artObj = {article: articledb};
			response.render("clipped", artObj);
		}).catch((error) => {
			response.json(error);
		}); 
	});
// scraper route and logic to capture values
	app.get("/scraper", (request, response)=> {
		axios.get("https://jalopnik.com/")
		.then((result)=> {
			// init cheerio load data from result object
			let $ = cheerio.load(result.data);

			$(".post-item-frontpage").each(function(i, element){
				let resObj = {};
				const title = $(this).children("header").children("h1").children("a").text();
				const link = $(this).children("header").children("h1").children("a").attr("href");
				const boilerplate = $(this).children("div.item__content").children("div.entry-summary").children("p").text();
				const author = $(this).children("header").children("div").children("div").children("div").children("a").text();
				const pic = $(this).children("div.item__content").children("figure").children("a").children("div").children("picture").children("source").attr("data-srcset");
				
				resObj.title = title;
				resObj.link = link;
				resObj.boilerplate = boilerplate;
				resObj.author = author;
				resObj.pic = pic;

				db.Article.create(resObj)
				.then((articledb) => {
					console.log(`\n item scraped: ${articledb}`);
				}).catch((err) => {
					console.log(`\n db save throw err: ${err}`);
				});
			});
			// redirect to appropriate route
			response.redirect("/articles");
			// error handling
		}).catch((error) => {
			console.log(`\n url get throw err: ${error}`);
		});
	});
// primary route to list main index
	app.get("/articles", (request, response) => {
		db.Article.find({})
		.sort({ timestamp: -1 })
		.then((articledb) => {
			let artObj = {article: articledb};
			response.render("index", artObj);
			// error handling
		}).catch((error) => {
			response.json(error);
		});
	});

// update route for onclick to set clipped to true for saved articles
	app.put("/article/:id", (request, response)=> {
		let id = request.params.id;
		db.Article.findByIdAndUpdate(id, {$set: {clipped: true}})
		.then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});

// update route for deleting clipped articles
	app.put("/article/remove/:id", (request, response) =>{
		let id = request.params.id;	
		db.Article.findByIdAndUpdate(id, {$set: {clipped: false}})
		.then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});

// route to populate notes by article id in db
	app.get("/article/:id", (request, response) => {
		db.Article.findOne({ _id: request.params.id })
		.populate("note")
		.then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});
// route to create new note associated by article
	app.post("/note/:id", (request, response) => {
		let id = request.params.id;
		db.Note.create(request.body)
		.then((notedb) => {
			return db.Article.findOneAndUpdate({ _id: request.params.id}, {$push: { note: notedb._id }}, { new: true, upsert: true})
		}).then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});
// route to delete a note associated to specific article
	app.delete("/note/:id", (request, response) => {
		let id = request.params.id;
		db.Note.remove({_id: id})
		.then((notedb) => {
			response.json({message: "note deleted."});
		}).catch((error) => {
			response.json(error);
		});
	});
}