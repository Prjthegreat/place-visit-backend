const jwt=require('jsonwebtoken');
const HttpError=require('../error/http-error')
const config=require('../config/config')
module.exports=(req,res,next)=>{
   if(req.method==='OPTIONS'){
     return next();
   }
   try{
     //console.log(req)
    const token=req.headers.authorization.split(' ')[1] //Authorization:'Bearer Token'
    
    if(!token){
        throw new Error('Authantication falied');
    }
      const decodedToken=jwt.verify(token,config.secret)
      req.userdata={email:decodedToken.email,userid:decodedToken.userid}
      next();
   }catch(err) {
     const error= new HttpError('Could not Authanticate',401);
     return next(error)
   }
  
}