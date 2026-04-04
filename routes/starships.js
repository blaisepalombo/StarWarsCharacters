const router = require('express').Router();
const mongodb = require('../db/connect');
const { ObjectId } = require('mongodb');
const requireApiAuth = require('../middleware/requireApiAuth');

const getCollection = () => {
  return mongodb.getDb().db(process.env.DB_NAME).collection('starships');
};

const buildStarship = (body) => ({
  name: body.name,
  model: body.model,
  manufacturer: body.manufacturer,
  crew: body.crew,
  passengers: body.passengers || '',
  starshipClass: body.starshipClass || '',
  hyperdriveRating: body.hyperdriveRating || ''
});

const validateStarship = (starship) => {
  if (!starship.name || !starship.model || !starship.manufacturer || !starship.crew) {
    return 'name, model, manufacturer, and crew are required';
  }
  return null;
};

router.get('/', async (req, res) => {
  try {
    const result = await getCollection().find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error('GET /starships error:', error);
    res.status(500).json({ message: 'Failed to get starships', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid starship ID' });
    }

    const result = await getCollection().findOne({ _id: new ObjectId(req.params.id) });

    if (!result) {
      return res.status(404).json({ message: 'Starship not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('GET /starships/:id error:', error);
    res.status(500).json({ message: 'Failed to get starship', error: error.message });
  }
});

router.post('/', requireApiAuth, async (req, res) => {
  try {
    const starship = buildStarship(req.body);
    const validationError = validateStarship(starship);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().insertOne(starship);

    res.status(201).json({
      message: 'Starship created successfully',
      id: result.insertedId,
      starship
    });
  } catch (error) {
    console.error('POST /starships error:', error);
    res.status(500).json({ message: 'Failed to create starship', error: error.message });
  }
});

router.put('/:id', requireApiAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid starship ID' });
    }

    const updatedStarship = buildStarship(req.body);
    const validationError = validateStarship(updatedStarship);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const result = await getCollection().replaceOne(
      { _id: new ObjectId(req.params.id) },
      updatedStarship
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Starship not found' });
    }

    res.status(200).json({
      message: 'Starship updated successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('PUT /starships/:id error:', error);
    res.status(500).json({ message: 'Failed to update starship', error: error.message });
  }
});

router.delete('/:id', requireApiAuth, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid starship ID' });
    }

    const result = await getCollection().deleteOne({ _id: new ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Starship not found' });
    }

    res.status(200).json({ message: 'Starship deleted successfully' });
  } catch (error) {
    console.error('DELETE /starships/:id error:', error);
    res.status(500).json({ message: 'Failed to delete starship', error: error.message });
  }
});

module.exports = router;