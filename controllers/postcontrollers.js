const mongoose=require('mongoose')
const User=require('../models/user')
const Post=require('../models/post')
const express=require('express')
const {cloudinary}=require('../Cloudinaryconfig/Cloudinary')
const config=require('../config/config')
const HttpError=require('../error/http-error')
const { hash,compare }=require('bcryptjs')

const jwt=require('jsonwebtoken')


const getAllPosts=async(req,res,next)=>{
    let posts
    try{
        posts= await Post.find({}) 
    }catch(err){
        const error= new HttpError('something went wrong unable to fetch post',500)
        return next(error) 
    }

    res.status(201).json({posts})
}

const getAllPostPagination=async(req,res,next)=>{
    const pno=parseInt(req.query.pno || 0 )
    const total_posts_at_time=3
    let posts
    try{
        posts= await Post.find({}).skip(pno*total_posts_at_time).limit(total_posts_at_time)
    }catch(err){

    }
    res.status(201).json({posts})
}

const getPostsByUserid=async(req,res,next)=>{
    const {uid}=req.params
    let userposts
    try{
        userposts= await Post.find({creator:uid})
    }catch(err){
        const error= new HttpError('Something went wrong while fetching user posts',500)
        return next(error)
    }

    res.status(201).json({posts:userposts})
}

const createPostByUserid=async(req,res,next)=>{
    const {uid}=req.params
    const {placename,description,location,images}=req.body
    let token=req.headers.authorization.split(' ')[1]
    let public_url_images=[]
    try{
        //await cloudinary.uploader.upload(image,{upload_preset:'Contest-image'})
        for(var i=0;i<images.length;i++){
            let obj={}
            const imageresponse=await cloudinary.uploader.upload(images[i],{upload_preset:'place-posts-images'})
            obj["secure_url"]=imageresponse.secure_url
            obj["public_id"]=imageresponse.public_id
            //public_url_images[i]["secure_url"]=imageresponse.secure_url
            //public_url_images[i]["public_id"]=imageresponse.public_id
            public_url_images.push(obj)
        }
    }catch(err){
        const error= new HttpError('Something went wrong while saving images',500)
        return next(error)
    }

    //console.log(public_url_images)
    let reqUser
    try{
      reqUser=await User.findById(uid)
    }catch(err){
        const error= new HttpError('User with this userid doest not exists',500)
        return next(error) 
    }

    const decodedToken=jwt.verify(token,config.secret)
    const newPost= new Post({
        placename,
        description,
        location,
        creator:uid,
        images:public_url_images
    })
    try{
     const sess= await mongoose.startSession() 
     sess.startTransaction();
     await newPost.save({session:sess})
     reqUser.posts.push(newPost)
     await reqUser.save({session:sess})
     await sess.commitTransaction()

    }catch(err){
        const error= new HttpError('Something went wrong, unable to save post',500)
        return next(error)  
    }
    res.status(201).json({post:newPost})
}

const updatePostByPostid=async(req,res,next)=>{
    const {description,location,images}=req.body
    const {pid}=req.params

    //first find the post by id
    let reqPost
    try{
        reqPost= await Post.findById(pid).populate('creator')
    }catch(err){
        const error= new HttpError('Something went wrong, while fetching this post',500)
        return next(error) 
    }
    
    //if post not found throw error
    if(!reqPost){
        const error= new HttpError('No such post found in database',500)
        return next(error) 
    }

    //this is to verify whether the user is trying to update its own post or someone's else...
    let confirm_post
    try{
       //if(reqPost.creator && reqPost.creator.posts){
        //console.log(reqPost.creator.posts.toString())
        await reqPost.creator.posts.forEach(element => {
            if(element.toString()===pid){
                console.log(pid)
                confirm_post=pid;
                return;
            }
        });
       //}
    }catch(err){
        const error= new HttpError('Something went wrong, while fetching this users post',500)
        return next(error) 
    }

    //this means it is bad request as user is trying to delete someoneelse post or maybe some other post of its own ...
   
    if(!confirm_post || confirm_post!==pid ){
        console.log(confirm_post)
        const error= new HttpError('Bad request',400)
        return next(error)
    }
    //now update this post....
      //first lets delete previous images from cloudinary
      try{
        for(var i=0;i<reqPost.images.length;i++){
            await cloudinary.uploader.destroy(reqPost.images[i]["public_id"])
         }
     }catch(err){
        const error= new HttpError('Something went wrong, while removing images from cloudinary',500)
        return next(error)   
     }

    reqPost.description=description
    reqPost.location=location

    let reqPost_image_public_url=[]

    try{
        for(var i=0;i<images.length;i++){
            let obj={}
            const imageresponse=await cloudinary.uploader.upload(images[i],{upload_preset:'place-posts-images'})
            obj["secure_url"]=imageresponse.secure_url
            obj["public_id"]=imageresponse.public_id
            //public_url_images[i]["secure_url"]=imageresponse.secure_url
            //public_url_images[i]["public_id"]=imageresponse.public_id
            reqPost_image_public_url.push(obj)
        }
    }catch(err){
        const error= new HttpError('Something went wrong while saving images',500)
        return next(error)
    }
    
    reqPost.images=reqPost_image_public_url
    try{
      await reqPost.save()
    }catch(err){
        const error= new HttpError('Something went wrong could not update this post',500)
        return next(error)
    }
    res.status(201).json({post:reqPost})
}

const deletePostByPostid=async(req,res,next)=>{
    const {pid}=req.params
     //first find the post by id
     let reqPost
     try{
         reqPost= await Post.findById(pid).populate('creator')
     }catch(err){
         const error= new HttpError('Something went wrong, while fetching this post',500)
         return next(error) 
     }
     
     //if post not found throw error
     if(!reqPost){
         const error= new HttpError('No such post found in database',500)
         return next(error) 
     }
 
     //this is to verify whether the user is trying to update its own post or someone's else...
     let confirm_post
    try{
       //if(reqPost.creator && reqPost.creator.posts){
        //console.log(reqPost.creator.posts.toString())
        await reqPost.creator.posts.forEach(element => {
            if(element.toString()===pid){
                console.log(pid)
                confirm_post=pid;
                return;
            }
        });
       //}
    }catch(err){
        const error= new HttpError('Something went wrong, while fetching this users post',500)
        return next(error) 
    }

    //this means it is bad request as user is trying to delete someoneelse post or maybe some other post of its own ...
   
    if(!confirm_post || confirm_post!==pid ){
        console.log(confirm_post)
        const error= new HttpError('Bad request',400)
        return next(error)
    }

     //npw delete the post
     //first lets delete images from cloudinary
     try{
        for(var i=0;i<reqPost.images.length;i++){
            await cloudinary.uploader.destroy(reqPost.images[i]["public_id"])
         }
     }catch(err){
        const error= new HttpError('Something went wrong, while removing images from cloudinary',500)
        return next(error)   
     }

     try{
      const sess= await mongoose.startSession()
         sess.startTransaction()
         await reqPost.remove({session:sess})
         reqPost.creator.posts.pull(reqPost)
         await reqPost.creator.save({session:sess})
         await sess.commitTransaction()

     }catch(err){
        const error = new HttpError(
            'Something went wrong, could not delete place.',
            500
          )
          return next(error)
     }

     res.json({message:'Post deleted successfully'})
}


exports.createPostByUserid=createPostByUserid
exports.getPostsByUserid=getPostsByUserid
exports.getAllPosts=getAllPosts
exports.getAllPostPagination=getAllPostPagination
exports.updatePostByPostid=updatePostByPostid
exports.deletePostByPostid=deletePostByPostid