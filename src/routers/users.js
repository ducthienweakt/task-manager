const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendRegisterEmail, sendCancelEmail} = require('../emails/account')

const router = new express.Router()
const uploadAvatar = multer({
    limits:{
        fileSize:1000000 //1mb
    },
    fileFilter(req, file, cb){
     if(!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png)$/)){
         return cb(new Error('File not supported!'))
     }
      cb(undefined, true)
    }
})


router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.post('/users', async (req, res) => {
    const newUser = new User(req.body)
    try {
         await newUser.save()
        const token = await newUser.generateAuthToken()
        
        sendRegisterEmail(newUser.name, newUser.email)
        res.status(201).send({token, newUser})
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) =>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({token, user: user})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) =>{
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('users/logoutAll', async (req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send(e)
    }
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['age', 'name', 'email', 'password']
    const isValid = updates.every((update) => allowedUpdate.includes(update))
    if (!isValid) {
        return res.status(400).send({
            error: 'Invalid params'
        })
    }
    try {
       
        updates.forEach((update) =>{
            req.user[update] = req.body[update]
        })
        result = await req.user.save()
        res.send(result)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/me/avatar', auth, uploadAvatar.single('avatar') ,async (req, res) =>{
    
    const buffer = await sharp(req.file.buffer)
    .resize(300, 300)
    .png()
    .toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send({message:'sent'})
},(error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async (req, res) =>{
    const user = await User.findById(req.params.id)
    if(!user && !user.avatar){
        return res.status(404).send({error:'avatar not found!'})
    }
    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        req.user.remove()
        sendCancelEmail(req.user.name, req.user.email)
        res.send(req.user)

    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router