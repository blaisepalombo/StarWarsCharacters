const router = require('express').Router();
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');
const requireApiAuth = require('../middleware/requireApiAuth');

const getCollection = () => {
  return mongodb.getDb().db(process.env.DB_NAME).collection('planets');
};

const buildPlanet = (body) => ({
  name: body.name,
  climate: body.climate,
  terrain: body.terrain,
  population: body.population,
  region: body.region || '',
  government: body.government || '',
  notableFor: body.notableFor || ''
});

const validatePlanet = (planet) => {
  if (!planet.name || !planet.climate || !planet.terrain || !planet.population) {
    return 'name, climate, terrain, and population are required';
  }
  return null;
};

router.get('/', async (req, res) => {
  try {
    const result = await getCollection().find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error('GET /planets error:', error);
    res.status(500).json({ message: 'Failed to get planets', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid planet ID' });
    }

    const result = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

    if (!result) {
      return res.status(404).json({ message: 'Planet not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('GET /planets/:id error:', error);
    res.status(500).json({ message: 'Failed to get planet', error: error.message });
  }
});

router.post('/', requireApiAuth, async (req, res) => {
  try {
    const planet = buildPlanet(req.body);
    const validationError = validatePlanet(planet);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().insertOne(planet);

    res.status(201).json({
      message: 'Planet created successfully',
      id: result.insertedId,
      planet
    });
  } catch (error) {
    console.error('POST /planets error:', error);
    res.status(500).json({ message: 'Failed to create planet', error: error.message });
  }
});

router.put('/:id', requireApiAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid planet ID' });
    }

    const updatedPlanet = buildPlanet(req.body);
    const validationError = validatePlanet(updatedPlanet);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().replaceOne(
      { _id: new ObjectId(req.params.id) },
      updatedPlanet
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Planet not found' });
    }

    res.status(200).json({
      message: 'Planet updated successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('PUT /planets/:id error:', error);
    res.status(500).json({ message: 'Failed to update planet', error: error.message });
  }
});

router.delete('/:id', requireApiAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid planet ID' });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Planet not found' });
    }

    res.status(200).json({ message: 'Planet deleted successfully' });
  } catch (error) {
    console.error('DELETE /planets/:id error:', error);
    res.status(500).json({ message: 'Failed to delete planet', error: error.message });
  }
});

module.exports = router;