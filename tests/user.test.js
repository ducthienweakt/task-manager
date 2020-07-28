const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {testUser, setupDb} = require('./fixtures/db')


beforeEach(setupDb)



test('Should sign up user', async () => {
    const result =   await request(app).post('/users')
    .send({
        name: "Dean Luong",
        email: "maike13@gmail.com",
        password: "1234567",
        age: 22
    }).expect(201)

    const user = User.findById(result.body.newUser._id)
    expect(user).not.toBeNull()

    expect(result.body).toMatchObject({
        newUser: {
            name: "Dean Luong",
            email: "maike13@gmail.com"
        }
    })

    expect(result.body.newUser.password).not.toBe("1234567")
    
})

test('Should login with existing user', async () => {
    await request(app).post('/users/login').send({
        email: testUser.email,
        password: testUser.password
    }).expect(200)
})

test('Should fail to login', async () => {
    await request(app).post('/users/login').send({
        email: testUser.email,
        password: testUser.password + '11'
    }).expect(400)
})

test('Should get profile', async ()=>{
    await request(app).get('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should fail to get profile (unauthen)', async() =>{
    request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app).post('/users/me/avatar')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .attach('avatar','tests/fixtures/avatar.jpg')
    .expect(200)
})

test('Should delete own user account', async() =>{
    await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should fail to delete own user account (unauthen)', async() =>{
    await request(app).delete('/users/me')
    .send()
    .expect(401)
})

