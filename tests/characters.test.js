const request = require('supertest');
const { ObjectId } = require('mongodb');
const app = require('../server');
const mongodb = require('../db/connect');

let insertedId;

beforeAll((done) => {
  mongodb.initDb((err) => {
    done(err);
  });
});

afterAll(async () => {
  try {
    if (insertedId) {
      await mongodb
        .getDb()
        .db(process.env.DB_NAME)
        .collection('characters')
        .deleteOne({ _id: new ObjectId(insertedId) });
    }

    await mongodb.getDb().close();
  } catch (error) {
    console.error('Test cleanup error:', error);
  }
});

describe('Characters API', () => {
  it('POST /characters should create a character and store it in MongoDB', async () => {
    const newCharacter = {
      name: 'Test Jedi',
      species: 'Human',
      homeworld: 'Test World',
      affiliation: 'Jedi Order',
      collection: 'Jedi',
      weapon: 'Lightsaber',
      forceUser: true,
      firstAppearance: 'Test Episode'
    };

    const response = await request(app)
      .post('/characters')
      .send(newCharacter)
      .set('Accept', 'application/json');

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('Character created successfully');
    expect(response.body.character.name).toBe('Test Jedi');
    expect(response.body.id).toBeDefined();

    insertedId = response.body.id;

    const savedCharacter = await mongodb
      .getDb()
      .db(process.env.DB_NAME)
      .collection('characters')
      .findOne({ _id: new ObjectId(insertedId) });

    expect(savedCharacter).not.toBeNull();
    expect(savedCharacter.name).toBe('Test Jedi');
    expect(savedCharacter.collection).toBe('Jedi');
  });
});