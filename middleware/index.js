var middleware={};
var Campground=require("../models/campground.js");
var Comment=require("../models/comments.js");
var User=require("../models/user.js")

middleware.CampgroundOwnership=function(req,res,next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id,function(err,foundcamp){
			if(err){
				res.redirect("back");
			}
			else{
				if(foundcamp.author.id.equals(req.user._id)){
					next();
				}
				else{
					res.redirect("back");
				}
			}
		});
	}
	else{
		req.flash("error","You must be logged in");
		res.redirect("/login");
	}
}

middleware.CommentOwnership=function(req,res,next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id,function(err,comment){
			if(err){
				res.redirect("back");
			}else{
				if(comment.author.id.equals(req.user._id)){
					next();
			}
				else{
					res.redirect("back");
				}
			}
	});

	}
	else{
		req.flash("error","You must be logged in");
		res.redirect("/login");	
	}
}
middleware.isLoggedIn=function(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error","You must be logged in");
	res.redirect("/login");
}

module.exports=middleware;
