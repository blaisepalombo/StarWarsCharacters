const request = require('supertest');
const { ObjectId } = require('mongodb');
const app = require('../server');
const mongodb = require('../db/connect');

let createdId;

beforeAll((done) => {
  app.set('bypassAuth', true);
  mongodb.initDb((err) => done(err));
});

afterAll(async () => {
  try {
    if (createdId && ObjectId.isValid(createdId)) {
      await mongodb
        .getDb()
        .db(process.env.DB_NAME)
        .collection('characters')
        .deleteOne({ _id: new ObjectId(createdId) });
    }
  } catch (error) {
    console.error('Character test cleanup error:', error);
  } finally {
    await mongodb.closeDb();
  }
});

describe('Characters API', () => {
  it('GET /characters should return 200', async () => {
    const res = await request(app).get('/characters');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /characters should create a character', async () => {
    const res = await request(app).post('/characters').send({
      name: 'Test Character',
      species: 'Human',
      homeworld: 'Test World',
      affiliation: 'Test Order',
      collection: 'Test Collection',
      weapon: 'Test Saber',
      forceUser: true,
      firstAppearance: 'Test Episode'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Character created successfully');
    expect(res.body.id).toBeDefined();

    createdId = res.body.id;
  });

  it('GET /characters/:id should return 400 for invalid id', async () => {
    const res = await request(app).get('/characters/invalid-id');
    expect(res.statusCode).toBe(400);
  });

  it('GET /characters/:id should return 200 for created character', async () => {
    const res = await request(app).get(`/characters/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Character');
  });

  it('PUT /characters/:id should update a character', async () => {
    const res = await request(app).put(`/characters/${createdId}`).send({
      name: 'Updated Test Character',
      species: 'Human',
      homeworld: 'Updated World',
      affiliation: 'Updated Order',
      collection: 'Updated Collection',
      weapon: 'Updated Weapon',
      forceUser: false,
      firstAppearance: 'Updated Episode'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Character updated successfully');
  });

  it('DELETE /characters/:id should delete a character', async () => {
    const res = await request(app).delete(`/characters/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Character deleted successfully');

    createdId = null;
  });
});