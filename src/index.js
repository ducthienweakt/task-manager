const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/users')
const taskRounter = require('./routers/tasks')

const app = express()
const port = process.env.PORT || 3000


app.use(express.json())
app.use(userRouter)
app.use(taskRounter)


app.listen(port, () => {
    console.log("Server start at port: %d", port)
})
