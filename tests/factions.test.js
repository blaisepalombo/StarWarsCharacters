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
        .collection('factions')
        .deleteOne({ _id: new ObjectId(createdId) });
    }
  } catch (error) {
    console.error('Faction test cleanup error:', error);
  } finally {
    await mongodb.closeDb();
  }
});

describe('Factions API', () => {
  it('GET /factions should return 200', async () => {
    const res = await request(app).get('/factions');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /factions should create a faction', async () => {
    const res = await request(app).post('/factions').send({
      name: 'Test Faction',
      leader: 'Test Leader',
      alignment: 'Neutral',
      headquarters: 'Test Base',
      founded: '2026',
      description: 'Created for testing'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Faction created successfully');
    expect(res.body.id).toBeDefined();

    createdId = res.body.id;
  });

  it('GET /factions/:id should return 400 for invalid id', async () => {
    const res = await request(app).get('/factions/invalid-id');
    expect(res.statusCode).toBe(400);
  });

  it('GET /factions/:id should return 200 for created faction', async () => {
    const res = await request(app).get(`/factions/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Faction');
  });

  it('PUT /factions/:id should update a faction', async () => {
    const res = await request(app).put(`/factions/${createdId}`).send({
      name: 'Updated Faction',
      leader: 'Updated Leader',
      alignment: 'Light Side',
      headquarters: 'Updated Base',
      founded: '2027',
      description: 'Updated for testing'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Faction updated successfully');
  });

  it('DELETE /factions/:id should delete a faction', async () => {
    const res = await request(app).delete(`/factions/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Faction deleted successfully');

    createdId = null;
  });
});