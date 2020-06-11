const mongoose=require('mongoose')

mongoose.connect(process.env.Mongoose,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true
})



// const me=new User({
//     name:'    No   ',
//     email:'noo@gmail.com',
//     password:'Password123'
// })

// me.save().then((me)=>{
//     console.log(me);
    
// }).catch((error)=>{
//     console.log(error);
// })



// const task1=new task({
//     description:'eat',
//     completed:true
// })

// task1.save().then((tsk)=>{
//     console.log(tsk);
    
// }).catch((error)=>{
//     console.log(error);
    
// })
