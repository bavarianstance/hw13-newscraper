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
				const boilerplate = $(this).children("div.item__content").children("div.entry-summary").children("p").text();
				const author = $(this).children("header").children("div").children("div").children("div").children("a").text();

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
		});
	});

	app.get("/articles", (request, response) => {
		db.Article.find({})
		.sort({ timestamp: -1 })
		.then((articledb) => {
			let artObj = {article: articledb};
			response.render("index", artObj);
		}).catch((error) => {
			response.json(error);
		});
	});

	app.put("/article/:id", (request, response)=> {
		let id = request.params.id;
		db.Article.findByIdAndUpdate(id, {$set: {clipped: true}})
		.then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});

	app.put("article/remove/:id", (request, response) =>{
		let id = request.params.id;	
		db.Article.findByIdAndUpdate(id, {$set: {clipped: false}})
		.then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});

	app.get("article/:id", (request, response) => {
		let id = request.params.id;
		db.Article.findById(id)
		.populate("note")
		.then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});

	app.post("/note/:id", (request, response) => {
		let id = request.params.id;
		db.Note.create(request.body)
		.then((notedb) => {
			return db.Article.findOneAndUpdate(
			{
				_id: id
			},
			{
				$push: {
					note: notedb._id
				}
			}, 
			{
				new: true, upsert: true
			});
		}).then((articledb) => {
			response.json(articledb);
		}).catch((error) => {
			response.json(error);
		});
	});

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