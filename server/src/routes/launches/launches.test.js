const request = require('supertest');
require('dotenv').config();
const {mongoConnect,mongoDisconnect} = require('../../services/mongo')
const app = require('../../app')


describe('Launch API',()=>{

    beforeAll(async ()=>{
        await mongoConnect();
    })

    // afterAll(async ()=>{
    //     await mongoDisconnect();
    // })

    describe('TEST GET /launches',()=>{
        test('It should respond with 200 success',async ()=>{
            const response = await request(app)
            .get('/v1/launches')
            .expect("Content-Type",/json/)
            .expect(200)
        });
    });
    
    describe('TEST POST /launch',()=>{
    
        const requestObjectWithDate = {
            mission:"Kepler Exploration X",
            rocket:"Explorer IS1",
            launchDate: 'December 27,2030',
            target:"Kepler-442 b"
        }
    
        const requestObjectWithoutDate = {
            mission:"Kepler Exploration X",
            rocket:"Explorer IS1",
            target:"Kepler-442 b"
        }
    
    
        const requestObjectWithInvalidDate = {
            mission:"Kepler Exploration X",
            rocket:"Explorer IS1",
            launchDate: 'sike',
            target:"Kepler-442 b"
        }
    
        test('It should respond with 201 success',async()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(requestObjectWithDate)
            .expect("Content-Type",/json/)
            .expect(201)
    
            const requestDate = new Date(requestObjectWithDate.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
      
            expect(requestDate).toBe(responseDate);
            expect(response.body).toMatchObject(requestObjectWithoutDate);
        })
    
    
        test('It should catch missing required properties',async ()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(requestObjectWithoutDate)
            .expect("Content-Type",/json/)
            .expect(400)
    
            expect(response.body).toStrictEqual({
                error:"missing required values"
            })
        })
    
        test('It should catch invalid dates',async ()=>{
            const response = await request(app)
            .post('/v1/launches')
            .send(requestObjectWithInvalidDate)
            .expect("Content-Type",/json/)
            .expect(400)
    
            expect(response.body).toStrictEqual({
                error:"invalid date"
            })
        })
    });
})
