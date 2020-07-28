const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Please provide correct Email!")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password is very simple!')
            }
        }
    },
    age: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 20) {
                throw new Error("User age at least 21")
            }

        }
    },
    avatar: {
        type: Buffer
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
},{
    timestamps: true,
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token  = await jwt.sign({_id: user._id}, process.env.JWT_SECRECT_KEY)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON = function(){
    const user = this
    const pubUser = user.toObject()

    delete pubUser.password
    delete pubUser.tokens
    delete pubUser.avatar

    return pubUser
}

userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error("No user found")
    }
    const isValid = await bcrypt.compare(password, user.password)
    if(!isValid){
        throw new Eroor("Password is not match")
    }
     return user
}

//hash password before saving
userSchema.pre("save", async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//delete all tasks when delete this user
userSchema.pre('remove', async function(next){
    const user = this

    await Task.deleteMany({owner: user._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User