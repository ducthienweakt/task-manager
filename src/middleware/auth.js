const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    console.log('middleware is checking')
    try{
        const token = req.header('Authorization').replace("Bearer ", "")
        const decode =  jwt.verify(token, process.env.JWT_SECRECT_KEY)
        const user = await User.findOne({email: decode.email, 'tokens.token' : token})
        if(!user){
            throw new Error()
        }
        req.token = token
        req.user = user
        next()

    }catch(e){
        res.status(401).send({error: 'Please authentication!'})
    }
}

module.exports = auth