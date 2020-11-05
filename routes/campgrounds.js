var express=require("express");
var router=express.Router();
var Campground=require("../models/campground.js");
var Comment=require("../models/comments.js");
var middleware=require("../middleware/index.js");
var multer=require("multer");
var path=require("path");
var fs=require("fs");
require('dotenv/config'); 
const escapeRegex = text => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
router.get("/campgrounds",function(req,res){
	let noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Campground.find({name: regex}, function(err, campgrounds) {
      if (err) {console.log(err); }
      else {
        if (campgrounds.length < 1) {
          noMatch = "No campgrounds found, please try again.";
        }
        res.render("campgrounds/campgrounds.ejs", { campgrounds:campgrounds,noMatch:noMatch});  
      }
    });
  }
  else{
	Campground.find({},function(err,campgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/campgrounds.ejs",{campgrounds:campgrounds});
		}
	})
	}
	
});

router.get("/campgrounds/new",middleware.isLoggedIn,function(req,res){
	res.render("campgrounds/new.ejs");
});

router.get("/campgrounds/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments").exec(function(err,camp){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/show.ejs",{campground:camp});
		}
	});	
});
router.get("/campgrounds/:id/edit",middleware.CampgroundOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,camp){
		if(err){
			console.log(err);
		}
		else{
			res.render("edit.ejs",{campgrounds:camp});
		}
	});
});
router.put("/campgrounds/:id/edit",middleware.CampgroundOwnership,function(req,res){
	var data={name:req.body.title,image:req.body.image,description:req.body.desc}
	Campground.findByIdAndUpdate(req.params.id,data,function(err,updated){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds/"+req.params.id)
		}

	})
})
router.delete("/campgrounds/:id",middleware.CampgroundOwnership,function(req,res){
	Campground.findByIdAndRemove(req.params.id,function(err){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	})
});

router.get("/about",function(req,res){
	res.render("about.ejs");
});

module.exports=router;
