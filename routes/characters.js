const router = require('express').Router();
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

const getCharactersCollection = () => {
  return mongodb.getDb().db('star_wars_characters').collection('characters');
};

router.get('/', async (req, res) => {
  try {
    const result = await getCharactersCollection().find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error('GET /characters error:', error);
    res.status(500).json({ message: 'Failed to get characters', error: error.message });
  }
});

router.get('/collection/:collection', async (req, res) => {
  try {
    const collectionName = req.params.collection;
    const result = await getCharactersCollection()
      .find({ collection: { $regex: `^${collectionName}$`, $options: 'i' } })
      .toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error('GET /characters/collection/:collection error:', error);
    res.status(500).json({ message: 'Failed to get characters by collection', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const result = await getCharactersCollection().findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('GET /characters/:id error:', error);
    res.status(500).json({ message: 'Failed to get character', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const character = {
      name: req.body.name,
      species: req.body.species,
      homeworld: req.body.homeworld || '',
      affiliation: req.body.affiliation,
      collection: req.body.collection,
      weapon: req.body.weapon || null,
      subType: req.body.subType || null,
      birth: req.body.birth || null,
      death: req.body.death || null
    };

    let extraFields = {};

    switch (req.body.collection) {
      case 'Force User':
        extraFields = {
          subType: req.body.subType,  // Jedi or Sith
          lightsaberColor: req.body.lightsaberColor,
          rank: req.body.rank,
          forceAbilities: req.body.forceAbilities || []
        };
        break;

      case 'Clone Trooper':
        extraFields = {
          designation: req.body.designation,
          unit: req.body.unit,
          armorType: req.body.armorType
        };
        break;
      
      case 'Droid':
        extraFields = {
          model: req.body.model,
          manufacturer: req.body.manufacturer,
          function: req.body.function
        };
        break;
      
      case 'Bounty Hunter':
        extraFields = {
          ship: req.body.ship,
          guildAffiliation: req.body.guildAffiliation
        };
        break;
      
      default:
        return res.status(400).json({ message: 'Invalid collection type' });
    }

    if (!character.name || !character.species || !character.affiliation || !character.collection) {
      return res.status(400).json({
        message: 'name, species, affiliation, and collection are required'
      });
    }

    console.log('POST body received:', character);

    const finalCharacter = { ...character, ...extraFields };

    const result = await getCharactersCollection().insertOne(finalCharacter);

    console.log('Insert result:', result);

    res.status(201).json({
      message: 'Character created successfully',
      id: result.insertedId,
      character: finalCharacter
    });
  } catch (error) {
    console.error('POST /characters error:', error);
    res.status(500).json({ message: 'Failed to create character', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const updatedCharacter = {
      name: req.body.name,
      species: req.body.species,
      homeworld: req.body.homeworld || '',
      affiliation: req.body.affiliation,
      collection: req.body.collection
    };

    if (!updatedCharacter.name || !updatedCharacter.species || !updatedCharacter.affiliation || !updatedCharacter.collection) {
      return res.status(400).json({
        message: 'name, species, affiliation, and collection are required'
      });
    }

    const result = await getCharactersCollection().replaceOne(
      { _id: new ObjectId(id) },
      updatedCharacter
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.status(200).json({
      message: 'Character updated successfully',
      id
    });
  } catch (error) {
    console.error('PUT /characters/:id error:', error);
    res.status(500).json({ message: 'Failed to update character', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const result = await getCharactersCollection().deleteOne({ _id: new ObjectId(id) });

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