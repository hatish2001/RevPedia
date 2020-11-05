var express=require('express');
var app =express();
var body=require('body-parser');
var methodOverrride=require('method-override');
const mongoose = require('mongoose');
var Campground=require("./models/campground.js")
var Notification = require("./models/notification");
var Comment=require("./models/comments.js");
var User=require("./models/user.js");
var passport=require("passport");
var passportLocal=require("passport-local");
var esession=require("express-session");
var passportLocalMongoose=require("passport-local-mongoose");
var methodOverride=require("method-override");
var flash=require("connect-flash");
var multer=require("multer");
var path=require("path");
var fs=require("fs");


//campground image setup
var storage= multer.diskStorage({
	destination: function(req,file,cb){
		cb(null,"uploads");
	},
	filename:function(req,file,cb){
		cb(null,file.fieldname+'-'+Date.now()+'.png');		
	}
});
var upload=multer({storage:storage});



//user pic setup
var storage1=multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"userpic");
	},
	filename:function(req,file,cb){
		cb(null,file.fieldname+'-'+Date.now()+'.png');
	}
});
var userupload=multer({storage:storage1});
//


//ROUTES
var campgroundRoutes=require("./routes/campgrounds.js");
var commentsRoutes=require("./routes/comments.js");
var indexRoutes=require("./routes/index.js");
var ratingroute=require("./routes/rating.js");
app.locals.moment=require("moment");
app.use(flash());

//
mongoose.connect('mongodb://localhost:27017/camp_v2', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//AUTHENTICATION INTITALIZATION
app.use(esession({
	secret:"hi my name is harishraj",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//
app.use(async function(req,res,next){
	res.locals.currentUser = req.user;
   if(req.user) {
    try {
      let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec();
      res.locals.notifications = user.notifications.reverse();
    } catch(err) {
      console.log(err.message);
    }
   }
	res.locals.success=req.flash("success");
	res.locals.error=req.flash("error");
	next();
})




app.use(body.urlencoded({extended:true}));
app.use(methodOverrride("_method"));
app.use(express.static('public'));
app.use(methodOverride("_method"));



	


app.use(campgroundRoutes);
app.use(commentsRoutes);
app.use(indexRoutes);
app.use(ratingroute);

app.post("/campgrounds",upload.single("image"),async function(req,res,next){
		var author={
		id:req.user._id,
		username:req.user.username
	}
	var newcampground={
		name:req.body.title,
		image:{
			data:fs.readFileSync(path.join(__dirname+'/uploads/'+req.file.filename)),
			contentType:"image/png/jpeg"
		},
		description:req.body.desc,
		author:author,
		price:req.body.price
	}
	 try {
      let campground = await Campground.create(newcampground);
      let user = await User.findById(req.user._id).populate('followers').exec();
      let newNotification = {
        username: req.user.username,
        campgroundId: campground.id
      }
      for(const follower of user.followers) {
        let notification = await Notification.create(newNotification);
        follower.notifications.push(notification);
        follower.save();
      }

      //redirect back to campgrounds page
      res.redirect(`/campgrounds/${campground.id}`);
    } catch(err) {
      req.flash('error', err.message);
      res.redirect('back');
    }
});
app.post("/signup",userupload.single("image"),function(req,res){
	var newUser=new User({
		username: req.body.username,
        email: req.body.email,
        phoneno: req.body.phoneno,
        name:req.body.name,
        image:{
        	data:fs.readFileSync(path.join(__dirname+'/userpic/'+req.file.filename)),
        	contentType:'image/png/jpeg'
        }
	});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			req.flash("error",err.message);	
			return res.redirect("/signup");
		}
		else{
			passport.authenticate("local")(req,res,function(){
				req.flash("success","Welcome "+user.username);
				res.redirect("/campgrounds");
			});
		}
	});
	res.redirect("/newuser");

})

var port=3000;
app.listen(3000,function(req,res){
	console.log('Server Started on port 3000');
});