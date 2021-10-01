const mongoose=require('mongoose')
const schema=mongoose.Schema

const postSchema=new schema({
    placename:{type:String,required:true},
    description:{type:String,minlength:5,required:true},
    location:{type:String,required:true},
    creator:{type:mongoose.Types.ObjectId,ref:'User'},
    images:[ { secure_url:String,public_id:String } ],
    likes:[{type:mongoose.Types.ObjectId,ref:'User'}],
    comments:[{ body:String, type:mongoose.Types.ObjectId,ref:'User'}],
    savedby:[{type:mongoose.Types.ObjectId,ref:'User'}]
})

const Post=mongoose.model('Post',postSchema)
module.exports=Post