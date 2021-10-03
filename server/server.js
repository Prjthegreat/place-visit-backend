const express=require('express')
require('dotenv').config()
const app=express()
const cors=require('cors')
const mongoose=require('mongoose')
const bodyParser=require('body-parser')
const userroutes=require('../routes/userRoutes')
const postroutes=require('../routes/postRoutes')


const url=`mongodb+srv://${process.env.DATA_BASE_ADMIN}:${process.env.DATA_BASE_PASSWORD}@cluster0.wdaug.mongodb.net/${process.env.DATA_BASE_NAME}?retryWrites=true&w=majority`

app.use(cors())

app.use(bodyParser.json())
app.get('/',async(req,res,next)=>{

    res.send('Welcome to express app')
})
app.use('/user',userroutes)
app.use('/post',postroutes)
mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true }).then(()=>{
    app.listen(5000,(err)=>{
        if(err){
            console.log(err)
            return;
        }
        console.log('server stared on port 5000')
    })
}).catch(err=>{
  console.log(err)
})
