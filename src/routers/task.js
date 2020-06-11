const express=require('express')
const router= new express.Router()
const Task=require('./../models/task')
const auth=require('./../middleware/auth')
require('./../db/mongoose')

router.post('/tasks',auth,(req,res)=>{
    const task=new Task({
        ...req.body,
        owner:req.user._id
    })
    task.save().then((task)=>{
        res.send(task)
    }).catch((error)=>{
        res.status(400).send(error)
    })
})

router.get('/tasks',auth,async(req,res)=>{
    const match={}
    const sort={}
    if(req.query.completed){
        match.completed=req.query.completed==='true'
    }
    if(req.query.sortBy){
        const parts=req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc' ? -1 :1
    }
    try{
        // const tasks=await Task.find({owner:req.user._id,completed:req.query.completed==='true'})
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        console.log(e);
        
        res.status(500).send(e)
    }
})



router.get('/tasks/:id',auth,async(req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findOne({_id,owner:req.user._id})
        if(!task){
            return res.status(404).send()
        }
        return res.send(task)
    }catch(e){
        res.status(500).send()
    }
})


router.patch('/tasks/:id',auth,async(req,res)=>{
    const _id=req.params.id
    const allow=['description','completed']
    const up=Object.keys(req.body)
    const isValid=up.every((up)=>{
        return allow.includes(up)
    })
    if(isValid===false){
        return res.status(400).send({error:'invalid updates'})
    }
    try{
        const task=await Task.findOne({_id,owner:req.user._id})
        up.forEach((up)=>{
            task[up]=req.body[up]
        })
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id
    try{
        const task=await Task.findOneAndDelete({_id,owner:req.user._id})
        if(!task) return res.status(404).send()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports=router
