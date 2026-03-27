const router = require('express').Router();
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

const getCollection = () => {
  return mongodb.getDb().db(process.env.DB_NAME).collection('characters');
};

const buildCharacter = (body) => {
  const baseCharacter = {
    name: body.name,
    species: body.species,
    homeworld: body.homeworld || '',
    affiliation: body.affiliation,
    collection: body.collection,
    weapon: body.weapon || '',
    forceUser: body.forceUser ?? false,
    firstAppearance: body.firstAppearance || ''
  };
  
  let details = {};
  const type = (body.collection || '').toLowerCase();
  
  // Force Users (Jedi/Sith)
  if (type === 'jedi' || type === 'sith') {
    details = {
      lightsabers: body.lightsabers || [],
      rank: body.rank || '',
      masters: body.masters || [],
      padawans: body.padawans || []
    };
  }

// Droids
else if (type === 'droid') {
  details = {
    model: body.model || '',
    manufacturer: body.manufacturer || '',
    primaryFunction: body.primaryFunction || ''
  };
}

// Clone Troopers
else if (type == 'clone') {
  details = {
    legions: body.legions || [],
    rank: body.rank || '',
    weapons: body.weapons || []
  };
}

// Mandalorians / Bounty Hunters
else if (type === 'mandalorian' || type === 'bounty hunter') {
  details = {
    clan: body.clan || '',
    armor: body.armor || '',
    ship: body.ship || '',
    bountyCount: body.bountyCount || 0
    };
  }
  return {
    ...baseCharacter,
    details
  };
};


const validateCharacter = (character) => {
  if (!character.name || !character.species || !character.affiliation || !character.collection) {
    return 'name, species, affiliation, and collection are required';
  }
  return null;
};

router.get('/', async (req, res) => {
  try {
    const result = await getCollection().find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error('GET /characters error:', error);
    res.status(500).json({ message: 'Failed to get characters', error: error.message });
  }
});

router.get('/collection/:collection', async (req, res) => {
  try {
    const result = await getCollection()
      .find({ collection: { $regex: `^${req.params.collection}$`, $options: 'i' } })
      .toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error('GET /characters/collection/:collection error:', error);
    res.status(500).json({ message: 'Failed to get characters by collection', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const result = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

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
    const character = buildCharacter(req.body);
    const validationError = validateCharacter(character);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().insertOne(character);

    res.status(201).json({
      message: 'Character created successfully',
      id: result.insertedId,
      character: character
    });
  } catch (error) {
    console.error('POST /characters error:', error);
    res.status(500).json({ message: 'Failed to create character', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const updatedCharacter = buildCharacter(req.body);
    const validationError = validateCharacter(updatedCharacter);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().replaceOne(
      { _id: new ObjectId(req.params.id) },
      updatedCharacter
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Character not found' });
    }

    res.status(200).json({
      message: 'Character updated successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('PUT /characters/:id error:', error);
    res.status(500).json({ message: 'Failed to update character', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid character ID' });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });
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