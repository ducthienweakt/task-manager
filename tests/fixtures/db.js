
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
    _id: testUserId,
    name: "Julien ",
    email: "julien@gmail.com",
    password: "1234567",
    age: 42,
    tokens:[
        {
            token: jwt.sign({_id:testUserId}, process.env.JWT_SECRECT_KEY)
        }
    ]
}

const setupDb = async () =>{
    await User.deleteMany()
    await new User(testUser).save()
}

module.exports ={
    testUserId,
    testUser,
    setupDb
}