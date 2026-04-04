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
        .collection('starships')
        .deleteOne({ _id: new ObjectId(createdId) });
    }
  } catch (error) {
    console.error('Starship test cleanup error:', error);
  } finally {
    await mongodb.closeDb();
  }
});

describe('Starships API', () => {
  it('GET /starships should return 200 and an array', async () => {
    const res = await request(app).get('/starships');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /starships should return 400 when required fields are missing', async () => {
    const res = await request(app).post('/starships').send({
      name: 'Incomplete Ship'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('name, model, manufacturer, and crew are required');
  });

  it('POST /starships should create a starship', async () => {
    const res = await request(app).post('/starships').send({
      name: 'Test Ship',
      model: 'Test Model',
      manufacturer: 'Test Manufacturer',
      crew: '5',
      passengers: '10',
      starshipClass: 'Freighter',
      hyperdriveRating: '1.5'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Starship created successfully');
    expect(res.body.id).toBeDefined();
    expect(res.body.starship.name).toBe('Test Ship');

    createdId = res.body.id.toString();
  });

  it('GET /starships/:id should return 400 for invalid id', async () => {
    const res = await request(app).get('/starships/invalid-id');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid starship ID');
  });

  it('GET /starships/:id should return 404 for valid but nonexistent id', async () => {
    const fakeId = new ObjectId().toString();
    const res = await request(app).get(`/starships/${fakeId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Starship not found');
  });

  it('GET /starships/:id should return 200 for created starship', async () => {
    const res = await request(app).get(`/starships/${createdId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Test Ship');
  });

  it('PUT /starships/:id should return 400 when required fields are missing', async () => {
    const res = await request(app).put(`/starships/${createdId}`).send({
      name: 'Bad Update'
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('name, model, manufacturer, and crew are required');
  });

  it('PUT /starships/:id should update a starship', async () => {
    const res = await request(app).put(`/starships/${createdId}`).send({
      name: 'Updated Ship',
      model: 'Updated Model',
      manufacturer: 'Updated Manufacturer',
      crew: '8',
      passengers: '12',
      starshipClass: 'Cruiser',
      hyperdriveRating: '2.0'
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Starship updated successfully');
  });

  it('DELETE /starships/:id should delete a starship', async () => {
    const res = await request(app).delete(`/starships/${createdId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Starship deleted successfully');

    createdId = null;
  });
});