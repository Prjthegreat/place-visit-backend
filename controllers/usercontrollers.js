const mongoose=require('mongoose')
const express=require('express')
const HttpError=require('../error/http-error')
const config=require('../config/config')
const {sendConfirmationEmail}=require('../config/nodemailer.config')
const User=require('../models/user')
const FB=require('fb')
const { hash,compare }=require('bcryptjs')
const jwt=require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const getAllUsers=async(req,res,next)=>{
  let users
  try{
   users=await User.find({},'-password -status -confirmationCode')
  }catch(err){
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    )
    return next(error)
  }
  res.status(201).json({users})
}

const getUserByUserid=async(req,res,next)=>{
  const userid=req.params.uid
  const uid=req.userdata.userid
  let reqUser
  try{
    reqUser= await User.findById(userid,'-password -status -confirmationCode')
  }catch(err){
    const error = new HttpError(
      'user not found',
      404
    )
    return next(error)
  }

  //now i want to check whether this user exists in my followig list or not...
   let myUser,isfollowing=false
  try{
    myUser= await User.findById(uid).populate('following','_id')
    myUser.following.forEach( user=>{
      if(user._id.toString()===userid){
         isfollowing=true
      }
    } )
  }catch(err){
    const error = new HttpError(
      'Something went wrong , Try again',
      404
    )
    return next(error)
  }


  res.status(201).json({user:reqUser,isfollowing})
}


const login=async(req,res,next)=>{
  const {email,password}=req.body
  let reqUser
  try {
      reqUser=await User.findOne({email})
  } catch (err) {
      //console.log(error)
      const error= new HttpError('Something went wrong, try again',500)
      return next(error)
  }
  if(!reqUser){
    const error= new HttpError('No user found with this id',404)
    return next(error)
  }
  
  try{
   const correctpass=await compare(password,reqUser.password)
   if(!correctpass){
    const error= new HttpError('Invalid credentials',401)
    return next(error)
   }
  }catch(err){
    const error= new HttpError('Something went wrong, try again',500)
      return next(error)
  }
  let token
  try{
    token=jwt.sign({email,userid:reqUser.id},config.secret,{expiresIn:'2h'})
  }catch(err){
    const error= new HttpError('Something went wrong, try again',500)
    return next(error)
  }
  
 res.status(201).json({token})
}

const mydetails=async(req,res,next)=>{
  const uid=req.userdata.userid
  let reqUser
  try{
    reqUser= await User.findById(uid).populate({path:'following',select:'_id',select:'name'}).populate(
       {path:'followers',select:'_id',select:'name'})
  }catch(err){
    const error= new HttpError('Something went wrong, while fetching user details',500)
    return next(error) 
  }

  return res.json({user:reqUser})
}

const signup=async(req,res,next)=>{
    const {name,email,password}=req.body
    console.log(name,email,password)
    let reqUser
    try {
        reqUser=await User.findOne({email})
    } catch (err) {
        //console.log(error)
        const error= new HttpError('Something went wrong, try again',500)
        return next(error)
    }
    if(reqUser){
      const error= new HttpError('User already exists with this id',500)
      return next(error)
    }

  
    const newUser= new User({
        name,
        email,
        password,
        confirmationCode:uuidv4(),
    })
   
    //let token=jwt.sign({ userid:newUser.id,email},config.secret,{expiresIn:'2h'})

    try{
      await newUser.save((err)=>{
        if (err) {
            res.status(500).send({ message: err });
                 return;
              }
     
            sendConfirmationEmail(
              newUser.name,
              newUser.email,
              newUser.confirmationCode
        );
      })
    }catch(err){
       console.log(err)
       return;
    }

    res.status(201).json({message:"An email has been sent to you on this email. Kindly verify your account."})
}

const getMyFollowingUsers=async(req,res,next)=>{
   const uid=req.userdata.userid
   let reqUser
   try{
     reqUser= await User.findById(uid,'-password').populate('following')
   }catch(err){
    const error= new HttpError('something wrong while fetching following users list',500)
    return next(error)
   }
   let followinguser=[]
   reqUser.following.forEach(user=>{
     const obj={_id:user._id,name:user.name,email:user.email}
     followinguser.push(obj)
   })
   res.status(201).json({users:followinguser})
}

const getMyFollowers=async(req,res,next)=>{
  const uid=req.userdata.userid
  let reqUser
  try{
    reqUser= await User.findById(uid).populate('followers')
  }catch(err){
    const error= new HttpError('something wrong while fetching followers list',500)
    return next(error)
  }
  let followers=[]
  reqUser.followers.forEach(user=>{
    const obj={_id:user._id,name:user.name,email:user.email}
    followers.push(obj)
  })
  res.status(201).json({users:followers})
}

const followUserByUserid=async(req,res,next)=>{
    const {fid}=req.params
    const uid=req.userdata.userid
    if(uid===fid){
      const error= new HttpError('Bad Request',400)
      return next(error)
    }
     let reqUser
     let followUser
    try{
      reqUser= await User.findById(uid)
      followUser= await User.findById(fid)
    }catch(err){
      const error= new HttpError('Something went wrong while fetching user',500)
    return next(error) 
    }

    if(!reqUser || !followUser ){
      const error= new HttpError('Bad Request',400)
      return next(error)
    }

    try{
        reqUser.following.push(followUser)
        followUser.followers.push(reqUser) 
       await reqUser.save()
        await followUser.save()
    }catch(err){
      const error= new HttpError('Something went wrong , Could not follow this user',500)
      return next(error) 

    }
    res.status(201).json({message: 'You follow this user now !!'})
}

const getMyFollowingUserPost=async(req,res,next)=>{
    const uid=req.userdata.userid
    const {fid}=req.params
    console.log(uid)
    let reqUser
   
    try{
      reqUser= await User.findById(uid).populate('following')
    }catch(err){
      const error= new HttpError('Something went wrong , while fetching user details',500)
      return next(error)
    }

    let verifyuser
    try{
         await reqUser.following.forEach(u=>{
           u.populate('posts')
        if(u._id.toString()===fid){
          console.log(fid)
          verifyuser=u
          return;
        }
      })
    }catch(err){
      const error= new HttpError('Something went wrong',500)
      return next(error)
    }

    if(!verifyuser){
      const error= new HttpError('Bad Request',400)
      return next(error) 
    }
     console.log('verify user.........')
    
    let newuser 
    try{
      newuser= await User.findById(fid).populate({path:'posts',populate:{ path:'creator',select:'_id',select:'name' }})
     //await verifyuser.posts.populate('creator') 
      //creator=await followinguser.posts.populate('creator')
    }catch(err){
      const error= new HttpError('something went wrong try again',500)
      return next(error) 
    }
     
 const newposts=newuser.posts.map(  post=>{
      let obj={post}
      if(post.savedby.find( user=>user._id.toString()===uid )){
        console.log('hi1')
        obj.issaved=true
      }else{
        console.log('hi2')
        obj.issaved=false
      }
      return obj
    } )


    //console.log(newposts)
   
    res.status(201).json({posts:newposts})

}


const verifyUser=(req,res,next)=>{
    User.findOne({
        confirmationCode: req.params.confirmationCode,
      })
        .then((user) => {
          if (!user) {
            return res.status(404).send({ message: "User Not found." });
          }
    
          user.status = "Active";
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
          });
        })
        .catch((e) => console.log("error", e));
        res.json({message:'Confirmation successfull'})
}



exports.getAllUsers=getAllUsers
exports.getUserByUserid=getUserByUserid
exports.login=login
exports.mydetails=mydetails
exports.signup=signup
exports.getMyFollowingUsers=getMyFollowingUsers
exports.getMyFollowers=getMyFollowers
exports.followUserByUserid=followUserByUserid
exports.getMyFollowingUserPost=getMyFollowingUserPost
exports.verifyUser=verifyUser
