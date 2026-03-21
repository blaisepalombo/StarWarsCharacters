const router = require('express').Router();
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');

const getCollection = () => {
  return mongodb.getDb().db(process.env.DB_NAME).collection('factions');
};

const buildFaction = (body) => ({
  name: body.name,
  leader: body.leader,
  alignment: body.alignment,
  headquarters: body.headquarters,
  founded: body.founded || '',
  description: body.description || ''
});

const validateFaction = (faction) => {
  if (!faction.name || !faction.leader || !faction.alignment || !faction.headquarters) {
    return 'name, leader, alignment, and headquarters are required';
  }
  return null;
};

router.get('/', async (req, res) => {
  try {
    const result = await getCollection().find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error('GET /factions error:', error);
    res.status(500).json({ message: 'Failed to get factions', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid faction ID' });
    }

    const result = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

    if (!result) {
      return res.status(404).json({ message: 'Faction not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('GET /factions/:id error:', error);
    res.status(500).json({ message: 'Failed to get faction', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const faction = buildFaction(req.body);
    const validationError = validateFaction(faction);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().insertOne(faction);

    res.status(201).json({
      message: 'Faction created successfully',
      id: result.insertedId,
      faction
    });
  } catch (error) {
    console.error('POST /factions error:', error);
    res.status(500).json({ message: 'Failed to create faction', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid faction ID' });
    }

    const updatedFaction = buildFaction(req.body);
    const validationError = validateFaction(updatedFaction);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().replaceOne(
      { _id: new ObjectId(req.params.id) },
      updatedFaction
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Faction not found' });
    }

    res.status(200).json({
      message: 'Faction updated successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('PUT /factions/:id error:', error);
    res.status(500).json({ message: 'Failed to update faction', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid faction ID' });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Faction not found' });
    }

    res.status(200).json({ message: 'Faction deleted successfully' });
  } catch (error) {
    console.error('DELETE /factions/:id error:', error);
    res.status(500).json({ message: 'Failed to delete faction', error: error.message });
  }
});

module.exports = router;