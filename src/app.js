const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRounter = require('./routers/tasks')

const app = express()


app.use(express.json())
app.use(userRouter)
app.use(taskRounter)


module.exports = app
