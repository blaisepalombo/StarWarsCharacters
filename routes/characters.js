const express = require('express');
const router = express.Router();
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

router.get('/', async (req, res) => {
  try {
    const result = await mongodb
      .getDb()
      .db(process.env.DB_NAME)
      .collection('characters')
      .find();

    const characters = await result.toArray();
    res.status(200).json(characters);
  } catch (error) {
    console.error('GET /characters error:', error);
    res.status(500).json({ message: 'Failed to fetch characters', error: error.message });
  }
});

router.get('/collection/:collection', async (req, res) => {
  try {
    const collectionName = req.params.collection;

    const result = await mongodb
      .getDb()
      .db(process.env.DB_NAME)
      .collection('characters')
      .find({ collection: collectionName });

    const characters = await result.toArray();
    res.status(200).json(characters);
  } catch (error) {
    console.error('GET /characters/collection/:collection error:', error);
    res.status(500).json({ message: 'Failed to fetch characters by collection', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const characterId = req.params.id;

    if (!ObjectId.isValid(characterId)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const character = await mongodb
      .getDb()
      .db(process.env.DB_NAME)
      .collection('characters')
      .findOne({ _id: new ObjectId(characterId) });

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.status(200).json(character);
  } catch (error) {
    console.error('GET /characters/:id error:', error);
    res.status(500).json({ message: 'Failed to fetch character', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, species, homeworld, affiliation, collection, weapon, forceUser, firstAppearance } = req.body;

    if (!name || !species || !affiliation || !collection) {
      return res.status(400).json({
        message: 'name, species, affiliation, and collection are required'
      });
    }

    const character = {
      name,
      species,
      homeworld,
      affiliation,
      collection,
      weapon,
      forceUser,
      firstAppearance
    };

    const result = await mongodb
      .getDb()
      .db(process.env.DB_NAME)
      .collection('characters')
      .insertOne(character);

    res.status(201).json({
      message: 'Character created successfully',
      id: result.insertedId,
      character
    });
  } catch (error) {
    console.error('POST /characters error:', error);
    res.status(500).json({ message: 'Failed to create character', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const characterId = req.params.id;

    if (!ObjectId.isValid(characterId)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const { name, species, homeworld, affiliation, collection, weapon, forceUser, firstAppearance } = req.body;

    if (!name || !species || !affiliation || !collection) {
      return res.status(400).json({
        message: 'name, species, affiliation, and collection are required'
      });
    }

    const updatedCharacter = {
      name,
      species,
      homeworld,
      affiliation,
      collection,
      weapon,
      forceUser,
      firstAppearance
    };

    const result = await mongodb
      .getDb()
      .db(process.env.DB_NAME)
      .collection('characters')
      .updateOne(
        { _id: new ObjectId(characterId) },
        { $set: updatedCharacter }
      );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.status(200).json({ message: 'Character updated successfully' });
  } catch (error) {
    console.error('PUT /characters/:id error:', error);
    res.status(500).json({ message: 'Failed to update character', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const characterId = req.params.id;

    if (!ObjectId.isValid(characterId)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const result = await mongodb
      .getDb()
      .db(process.env.DB_NAME)
      .collection('characters')
      .deleteOne({ _id: new ObjectId(characterId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.status(200).json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('DELETE /characters/:id error:', error);
    res.status(500).json({ message: 'Failed to delete character', error: error.message });
  }
});

module.exports = router;