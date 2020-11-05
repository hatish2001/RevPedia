var express = require("express");
var router=express.Router();
var Campground = require("../models/campground");
var Rating = require("../models/rating");
var middleware = require("../middleware");
var user=require("../models/user");

router.post('/campgrounds/:id/rating', middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground) {
		if(err) {
			console.log(err);
		} else{
				Rating.create(req.body.rating, function(err, rating) {
				  if(err) {
				    console.log(err);
				  }
				  rating.author.id = req.user._id;
				  rating.author.username = req.user.username;
				  rating.save();
					campground.ratings.push(rating);
					campground.save();
					req.flash("success", "Successfully added rating");
				});
		}
		res.redirect('/campgrounds/' + campground._id);
	});
});

module.exports = router;