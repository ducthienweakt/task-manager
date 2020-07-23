const sendGrid = require('@sendgrid/mail')

sendGrid.setApiKey(process.env.SENDGRID_API_KEY)


const sendRegisterEmail = (name, email) =>{
    const message = {
        from:'taskmanager@gmail.com',
        to: email,
        subject:`Welcome  ${name}!`,
        text: `This is very first email for you, ${name}. Thank you for joining in!`
    }
    sendGrid.send(message)
}

const sendCancelEmail = (name, email) =>{
    const message =  {
        to: email,
        from: 'taskmanager@gmail.com',
        subject: `Hope to see you again, ${name}!`,
        text: `So sad to say goodbye ${name}..`
    }
    sendGrid.send(message)
}

module.exports ={
    sendRegisterEmail,
    sendCancelEmail
}