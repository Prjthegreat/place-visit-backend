const express=require('express')
const router=express.Router()
const {check,body}=require('express-validator')
const {
  createMyPost,
  getAllPosts,
  getAllPostPagination,
  getMyUserPosts,
  updatePostByPostid,
  deletePostByPostid,
  savethispost,
  unsaveSavedPost,
  getMySavedPosts
}=require('../controllers/postcontrollers')
const authMiddleware=require('../middlewares/check-auth')

router.get('/getallposts',authMiddleware,getAllPosts)
router.get('/getsomeposts',getAllPostPagination)
router.get('/mypost',authMiddleware,getMyUserPosts)
router.get('/savepost/:pid',authMiddleware,savethispost)
router.get('/unsavepost/:pid',authMiddleware,unsaveSavedPost)
router.get('/getsavedposts',authMiddleware,getMySavedPosts)
router.post('/createpost',[
  body('placename').not().isEmpty(),
  body('description').isLength({min:5}),
  body('rating').isNumeric(),
  body('location').not().isEmpty(),
  body('images').isArray({min:1})
],authMiddleware,createMyPost)
router.patch('/updatepost/:pid',[
  body('description').not().isLength({min:5}),
  body('rating').isNumeric({min:1,max:5}),
  body('location').not().isEmpty(),
  body('images').isArray({min:1}),
],authMiddleware,updatePostByPostid)
router.delete('/deletepost/:pid',authMiddleware,deletePostByPostid)

module.exports=router