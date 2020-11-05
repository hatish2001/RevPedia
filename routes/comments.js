var express=require("express");
var router=express.Router();
var Campground=require("../models/campground.js");
var Comment=require("../models/comments.js");
var User=require("../models/user.js");		
var middleware=require("../middleware/");

router.get("/campgrounds/:id/comment",middleware.isLoggedIn,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/comments.ejs",{campground:campground});
		}
	});
});
router.post("/campground/:id/comment",function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
		}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					console.log(err);
				}
				else{
					User.findById(req.user._id,function(err,user){
						if(err){
							console.log(err);
						}
						else{
							user.noofcomments+=1;
							user.save();
						}
					});
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					comment.save(); 
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/"+campground._id);
				}
			})
		}
	})
});
router.get("/campgrounds/:id/comment/:comment_id/edit",middleware.CommentOwnership,function(req,res){
	var id=req.params.id;
	Comment.findById(req.params.comment_id,function(err,comment){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/editComment.ejs",{id:id,comment:comment});
		}
	});
});
router.put("/campgrounds/:id/comment/:comment_id/edit",middleware.CommentOwnership,function(req,res){
	var data={text:req.body.comment};
	Comment.findByIdAndUpdate(req.params.comment_id,data,function(err,comment){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});
router.delete("/campgrounds/:id/comment/:comment_id",middleware.CommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err){
			console.log(err);
		}
		else{
			res.redirect('/campgrounds/'+req.params.id)
		}
	});
});




module.exports=router;