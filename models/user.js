var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");
var userSchema=mongoose.Schema({
	username:String,
	password:String,
	name:String,
	email:String,
	phoneno:Number,
	image:{
		data:Buffer,
		contentType:String
	},
	noofcamps:{
		type:Number,
		default:0
	},
	noofcomments:{
		type:Number,
		default:0
	},

	 notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ]
});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema)