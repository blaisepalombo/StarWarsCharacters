const router = require('express').Router();

const sampleCharacters = [
  {
    id: '1',
    name: 'Luke Skywalker',
    species: 'Human',
    homeworld: 'Tatooine',
    affiliation: 'Jedi Order',
    collection: 'Jedi'
  },
  {
    id: '2',
    name: 'Darth Vader',
    species: 'Human',
    homeworld: 'Tatooine',
    affiliation: 'Sith',
    collection: 'Sith'
  },
  {
    id: '3',
    name: 'R2-D2',
    species: 'Droid',
    homeworld: 'Naboo',
    affiliation: 'Rebel Alliance',
    collection: 'Droids'
  },
  {
    id: '4',
    name: 'Boba Fett',
    species: 'Human',
    homeworld: 'Kamino',
    affiliation: 'Bounty Hunter',
    collection: 'Bounty Hunters'
  }
];

router.get('/', (req, res) => {
  res.status(200).json(sampleCharacters);
});

router.get('/collection/:collection', (req, res) => {
  const collectionName = req.params.collection.toLowerCase();
  const filteredCharacters = sampleCharacters.filter(
    (character) => character.collection.toLowerCase() === collectionName
  );

  res.status(200).json(filteredCharacters);
});

router.get('/:id', (req, res) => {
  const character = sampleCharacters.find((c) => c.id === req.params.id);

  if (!character) {
    return res.status(404).json({ message: 'Character not found' });
  }

  res.status(200).json(character);
});

router.post('/', (req, res) => {
  const newCharacter = {
    id: String(sampleCharacters.length + 1),
    ...req.body
  };

  res.status(201).json({
    message: 'Character created successfully',
    character: newCharacter
  });
});

router.put('/:id', (req, res) => {
  const character = sampleCharacters.find((c) => c.id === req.params.id);

  if (!character) {
    return res.status(404).json({ message: 'Character not found' });
  }

  res.status(200).json({
    message: `Character ${req.params.id} updated successfully`,
    updatedCharacter: {
      id: req.params.id,
      ...req.body
    }
  });
});

router.delete('/:id', (req, res) => {
  const character = sampleCharacters.find((c) => c.id === req.params.id);

  if (!character) {
    return res.status(404).json({ message: 'Character not found' });
  }

  res.status(200).json({
    message: `Character ${req.params.id} deleted successfully`
  });
});

module.exports = router;