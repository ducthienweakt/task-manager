const express = require('express')
const Task = require('./../models/task')
const auth = require('./../middleware/auth')
const router = new express.Router()


// GET /tasks?completed=true
// GET /tasks?limit=10?skip=20
// GET /tasks?sortBy=createdAt:asc
router.get('/tasks', auth, async (req, res) => {
    const match ={}
    const sort ={}
    if(req.query.completed){
        match.completed = req.query.completed
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1]==='desc'? -1 : 1
    }
    try {
        await req.user.populate({
            path:'tasks',
            match,
            options: {
                limit : parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const task = await Task.findOne({_id:req.params.id, owner: req.user._id})
    try {
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/tasks', auth, async (req, res) => {
    try {
        const newTask =new Task({
            ...req.body,
            owner: req.user._id
        })
        const result = await newTask.save()
        res.status(201).send(result)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const allowedUpdates = ['description', 'completed']
    const updates = Object.keys(req.body)
    const isValid = updates.every((update) => allowedUpdates.includes(update))
    if (!isValid) {
        return res.status(400).send({
            error: 'Invalid input'
        })
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((field) =>{
            task[field] = req.body[field]
        })
        const result = await task.save()
        return res.send(result)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) =>{
    try{
        const result = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id})
        if(!result){
            res.status(404).send()
        }
        res.send(result)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router