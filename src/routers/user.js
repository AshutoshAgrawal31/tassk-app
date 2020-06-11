const express=require('express')
const router= new express.Router()
const User=require('./../models/user')
const auth=require('./../middleware/auth')
require('./../db/mongoose')
const multer =require('multer')
const sharp=require('sharp')
const mail=require('../emails/account')
const upload=multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }
        return cb(undefined,true)
    }
})

router.post('/users',async (req,res)=>{
    const user= new User(req.body)
    
    try{
        await user.save()
        mail.sendmail(user.email,user.name)
        const token=await user.generateToken()
        res.status(201).send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login',async(req,res)=>{
    try{
        const user=await User.findUser(req.body.email,req.body.password)
        const token=await user.generateToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res)=>{
    try{
        req.user.tokens=req.user.tokens.filter((tk)=>{
            return tk.token!==req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.post('/users/logoutall',auth,async(req,res)=>{
    try{
        req.user.tokens=[]
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

router.get('/users/me',auth,async(req,res)=>{
    res.send(req.user)
})

router.patch('/users/me',auth,async(req,res)=>{
    const allow=['name','email','password','age']
    const up=Object.keys(req.body)
    const isValid=up.every((up)=>{
        return allow.includes(up)
    })
    if(isValid===false){
        return res.status(400).send({error:'invalid updates'})
    }
    try{
        up.forEach((up)=>{
            req.user[up]=req.body[up]
        })
        await req.user.save()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})


router.delete('/users/me',auth,async (req,res)=>{
    const _id=req.user._id
    try{
        await req.user.remove()
        mail.cancelmail(req.user.email,req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
    // req.user.avatar=req.file.buffer
    const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
    await req.user.save()
    res.send()
},(error,req,res,next)=>{
    res.status(404).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async(req,res)=>{
    if(!req.user.avatar){
        return res.status(404).send('avatar not available')
    }
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar',async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
    
})


module.exports=router

