var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user.js");
var Notification = require("../models/notification");
var middleware=require("../middleware/index.js");
var Faq=require("../models/faq.js");
var { isLoggedIn } = require('../middleware');
router.get("/",function(req,res){
	res.render("landing.ejs");
});
var multer=require("multer");
var path=require("path");
var fs=require("fs");
var nodemailer = require("nodemailer");

//multer setup
var storage=multer.diskStorage({
	destination:function(req,file,cb){
		cb(null,"userpic");
	},
	filename:function(req,file,cb){
		cb(null,file.fieldname+'-'+Date.now()+'.png');
	}
});
var userupload=multer({storage:storage});







router.get("/signup",function(req,res){
	res.render("signup.ejs");
	
});

router.get("/login",function(req,res){
	res.render("login.ejs");
});
router.post("/login",passport.authenticate("local",{
	successRedirect:"/campgrounds",
	failureRedirect:"/login",
	failureFlash: true,
	failureFlash: "Invalid username or password",
	successFlash: "Welcome Back",
}),function(req,res){

});

router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","You have succesfully been logged out");
	res.redirect("/");
})
router.get("/getuser",middleware.isLoggedIn,function(req,res){
	User.findById(req.user._id,function(err,founduser){
		res.render("userinfo.ejs",{founduser:founduser});
	})
})
router.get("/getuser/:id",middleware.isLoggedIn,function(req,res){
	User.findById(req.params.id,function(err,founduser){
		res.render("userinfo.ejs",{founduser:founduser});
	})
})



// user profile
router.get('/users/:id', async function(req, res) {
  try {
    let user = await User.findById(req.params.id).populate('followers').exec();
    res.render('profile', { user });
  } catch(err) {
    req.flash('error', err.message);
    return res.redirect('back');
  }
});

// follow user
router.get('/follow/:id', isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.params.id);
    user.followers.push(req.user._id);
    user.save();
    req.flash('success', 'Successfully followed ' + user.username + '!');
    res.redirect('/campgrounds');
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// view all notifications
router.get('/notifications', isLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id).populate({
      path: 'notifications',
      options: { sort: { "_id": -1 } }
    }).exec();
    let allNotifications = user.notifications;
    res.render('prevnoti.ejs', { allNotifications });
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});

// handle notification
router.get('/notifications/:id', isLoggedIn, async function(req, res) {
  try {
    let notification = await Notification.findById(req.params.id);
    notification.isRead = true;
    notification.save();
    res.redirect(`/campgrounds/${notification.campgroundId}`);
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }
});



router.get('/newuser',isLoggedIn,function(req,res){
  var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'noreplyrevpedia@gmail.com',
    pass: 'revpedia123'
  }
});

var mailOptions = {
  from: 'noreplyrevpedia@gmail.com',
  to: req.user.email,
  subject: 'Welcome to RevPedia',
  html: '<h1>Welcome</h1><p>Welcome to RevPedia, we hope you like our website and reccomend it to your friends</p><img src="https://images.unsplash.com/photo-1478428036186-d435e23988ea?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80">'

};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

res.redirect("/campgrounds");

})


router.get("/faq",function(req,res){
  Faq.find({},function(err,faq){
    if(err){
      console.log(err);
    }
    else{
      res.render("faq.ejs",{faq:faq});
    }
  });
});
router.get("/newfaq",function(req,res){
  res.render("newfaq.ejs");
})
router.post("/newfaq",function(req,res){
  var fr={
    question:req.body.query,
    name:req.body.uname
  }
  Faq.create(fr,function(err,faq){
    if(err){
      console.log(err);
    }
    else{
      res.redirect("/faq");
    }
  })
});


module.exports=router;
