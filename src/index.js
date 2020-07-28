const app = require('./app')

const port = process.env.port

app.listen(port, ()=>{
    console.log('App is running under port: %d', port)
})
