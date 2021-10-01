const mongoose=require('mongoose')
const {hash,compare}=require('bcryptjs')
const schema=mongoose.Schema

const userSchema= new schema({
    name:{type:String,required:true},
    email:{type:String, required:true },
    password:{type:String,required:true,minlength:5},
    status:{
        type:String,
        enum:['Pending','Active'],
        default:'Pending'
    },
    confirmationCode:{
        type:String,
        unique:true
    },
    posts:[{ type:mongoose.Types.ObjectId,ref:'Post' }],
    savedposts:[{ type:mongoose.Types.ObjectId,ref:'Post' }]
})

userSchema.pre('save',async function(next){
    if(this.isModified('password')){
        try{
           this.password=await hash(this.password,10)
        }catch(err){
           next(err)
        }
      
       }
       next()
})
// userSchema.statics.doesntexists= async function(options){
//     return await this.where(options).countDocuments()===0
//  }
//  userSchema.path('email').validate(function (email) {
//     //var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
//     //return emailRegex.test(email.text); // Assuming email has a text attribute
//    return User.doesntexists({email})
//  }, 'email already exists.')
const User= mongoose.model('User',userSchema)

module.exports=User