var mongoose=require('mongoose');
var campgroundSchema=new mongoose.Schema({
	name:String,
	image:{
		data:Buffer,
		ContentType:String
	},
	description:String,
	comments:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Comment"
	}],
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username:String
	},
	createdat:{
		type:Date,
		default:Date.now()
	},
	ratings: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Rating"
      }
   ],
   rating: { type: Number, default: 0 },
   price:Number
});
module.exports=mongoose.model("Campground",campgroundSchema);
