const express=require('express')
const router=express.Router()
const {check,body}=require('express-validator')
const {signup,verifyUser,getUserByUserid,getAllUsers,login}=require('../controllers/usercontrollers')

//router.post('/login')
router.get('/getallusers',getAllUsers)
router.post('/login',login)
router.get('/:uid',getUserByUserid)
router.post('/signup',[
    body('name').not().isEmpty(),
    body('email').isEmail(),
    body('password').isLength({min:5})
],signup)

router.get("/auth/confirm/:confirmationCode",verifyUser)

module.exports=router