const request = require('supertest');
const app = require('../server');
const mongodb = require('../db/connect');

describe('Authentication enforcement', () => {
  beforeAll((done) => {
    app.set('bypassAuth', false);
    mongodb.initDb((err) => done(err));
  });

  afterAll(async () => {
    app.set('bypassAuth', true);
    await mongodb.closeDb();
  });

  it('GET /characters should remain public', async () => {
    const res = await request(app).get('/characters');
    expect(res.statusCode).toBe(200);
  });

  it('POST /characters should require authentication', async () => {
    const res = await request(app).post('/characters').send({
      name: 'Unauthenticated Character',
      species: 'Human',
      affiliation: 'None',
      collection: 'Test'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authentication required');
  });

  it('PUT /factions/:id should require authentication', async () => {
    const res = await request(app).put('/factions/507f1f77bcf86cd799439011').send({
      name: 'Test Faction',
      leader: 'Test Leader',
      alignment: 'Neutral',
      headquarters: 'Test Base'
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authentication required');
  });

  it('DELETE /planets/:id should require authentication', async () => {
    const res = await request(app).delete('/planets/507f1f77bcf86cd799439011');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Authentication required');
  });
});