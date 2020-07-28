const request = require('supertest')
const Task = require('./../src/models/task')
const app = require('../src/app')
const {setupDb, testUser} = require('./fixtures/db')

beforeEach(setupDb)

test('Should create a task for user', async () =>{
    const result = await request(app).post('/tasks')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
        description:'Task number #1'
    })
    .expect(201)

    const task = await Task.findById(result.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})
