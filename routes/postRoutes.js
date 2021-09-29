const express=require('express')
const router=express.Router()
const {check,body}=require('express-validator')
const {
  createPostByUserid,
  getAllPosts,
  getAllPostPagination,
  getPostsByUserid,
  updatePostByPostid,
  deletePostByPostid
}=require('../controllers/postcontrollers')
const authMiddleware=require('../middlewares/check-auth')

router.get('/getallposts',getAllPosts)
router.get('/getsomeposts',getAllPostPagination)
router.get('/user/:uid',authMiddleware,getPostsByUserid)
router.post('/createpost/:uid',[
  body('placename').not().isEmpty(),
  body('description').isLength({min:5}),
  body('location').not().isEmpty(),
  body('images').isArray({min:1})
],authMiddleware,createPostByUserid)
router.patch('/updatepost/:pid',[
  body('description').not().isLength({min:5}),
  body('location').not().isEmpty(),
  body('images').isArray({min:1}),
],authMiddleware,updatePostByPostid)
router.delete('/deletepost/:pid',authMiddleware,deletePostByPostid)

module.exports=router