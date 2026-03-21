const request = require('supertest');
const { ObjectId } = require('mongodb');
const app = require('../server');
const mongodb = require('../db/connect');

let createdId;

beforeAll((done) => {
  mongodb.initDb((err) => done(err));
});

afterAll(async () => {
  try {
    if (createdId && ObjectId.isValid(createdId)) {
      await mongodb
        .getDb()
        .db(process.env.DB_NAME)
        .collection('planets')
        .deleteOne({ _id: new ObjectId(createdId) });
    }
  } catch (error) {
    console.error('Planet test cleanup error:', error);
  } finally {
    await mongodb.closeDb();
  }
});

describe('Planets API', () => {
  it('GET /planets should return 200', async () => {
    const res = await request(app).get('/planets');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /planets should create a planet', async () => {
    const res = await request(app).post('/planets').send({
      name: 'Test Planet',
      climate: 'Mild',
      terrain: 'Rocky',
      population: '5000',
      region: 'Outer Rim',
      government: 'None',
      notableFor: 'Testing'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Planet created successfully');
    expect(res.body.id).toBeDefined();

    createdId = res.body.id;
  });

  it('GET /planets/:id should return 400 for invalid id', async () => {
    const res = await request(app).get('/planets/invalid-id');
    expect(res.statusCode).toBe(400);
  });

  it('GET /planets/:id should return 200 for created planet', async () => {
    const res = await request(app).get(`/planets/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Planet');
  });

  it('PUT /planets/:id should update a planet', async () => {
    const res = await request(app).put(`/planets/${createdId}`).send({
      name: 'Updated Planet',
      climate: 'Hot',
      terrain: 'Desert',
      population: '7000',
      region: 'Mid Rim',
      government: 'Republic',
      notableFor: 'Updated testing'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Planet updated successfully');
  });

  it('DELETE /planets/:id should delete a planet', async () => {
    const res = await request(app).delete(`/planets/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Planet deleted successfully');

    createdId = null;
  });
});