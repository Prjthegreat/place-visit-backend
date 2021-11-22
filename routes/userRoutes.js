const express=require('express')
const router=express.Router()
const {check,body}=require('express-validator')
const authMiddleware=require('../middlewares/check-auth')
const {signup,verifyUser,getUserByUserid,
    getAllUsers,login,mydetails,getMyFollowingUsers,
    getMyFollowers,followUserByUserid,getMyFollowingUserPost}=require('../controllers/usercontrollers')

//router.post('/login')
router.get('/getallusers',getAllUsers)
router.post('/login',login)
router.get('/me',authMiddleware,mydetails)
router.get('/followingusers',authMiddleware,getMyFollowingUsers)
router.get('/followers',authMiddleware,getMyFollowers)
router.get('/follow/:fid',authMiddleware,followUserByUserid)
router.get('/followinguserpost/:fid',authMiddleware,getMyFollowingUserPost)
router.get('/:uid',authMiddleware,getUserByUserid)
router.post('/signup',[
    body('name').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({min:5})
],signup)

router.get("/auth/confirm/:confirmationCode",verifyUser)

module.exports=router