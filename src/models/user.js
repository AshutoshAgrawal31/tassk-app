const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task=require('./task')

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    age:{
        type: Number,
        default:0,
        validate(value){
            if(value<0){
                throw new Error('positive')
            }
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid email')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password in password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.toJSON = function(){
    const user=this
    const userobj=user.toObject()
    // console.log(obj);
        
    delete userobj.password
    delete userobj.tokens
    delete userobj.avatar

    console.log(userobj);
    

    return userobj
}

userSchema.methods.generateToken = async function(){
    const user = this
    const token=jwt.sign({_id:user._id.toString()},process.env.jwt_secret)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return  token
}

userSchema.statics.findUser = async(email,password)=>{
    const user= await User.findOne({email})
    if(!user){
        throw new Error('Unable to login')
    }
    const match=await bcrypt.compare(password,user.password)
    if(!match){
        throw new Error('Unable to login')
    }
    return user
}
//Hash the password
userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password=await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User=mongoose.model('User',userSchema)
module.exports=User
