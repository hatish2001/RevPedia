var mongoose=require('mongoose');
var faqschema=new mongoose.Schema({
	question:String,
	name:String
});
module.exports=mongoose.model("Faq",faqschema);