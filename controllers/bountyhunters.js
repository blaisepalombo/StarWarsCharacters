const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;

const getAll = (req, res, next) => {
  mongodb.getDb().collection('bountyhunters').find().toArray().then((lists) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(lists);
  }).catch((err) => {
    res.status(500).json({ message: err.message });
  });
};

const getSingle = (req, res, next) => {
  const userId = new ObjectId(req.params.id);
  mongodb
    .getDb()
    .collection('bountyhunters')
    .find({ _id: userId })
    .toArray()
    .then((lists) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json(lists[0]);
    })
    .catch((err) => {
      res.status(500).json({ message: err.message });
    });
};

const createBountyHunter = async (req, res) => {
    try {
        console.log('Received body:', req.body);
        
        if (!req.body || !req.body.name) {
            return res.status(400).json({ message: 'Request body is missing or invalid', body: req.body });
        }
        
        const bountyHunter = {
            name: req.body.name,
            appearance: req.body.appearance,
            homeworld: req.body.homeworld,
            species: req.body.species,
            weapon: req.body.weapon,
            affiliation: req.body.affiliation,
        };
        
        const response = await mongodb.getDb().collection('bountyhunters').insertOne(bountyHunter);
        console.log('Insert response:', response);
        
        if (response.acknowledged) {
            res.status(201).json(response); 
        } else {
            res.status(500).json({ message: 'Some error occurred while creating the bounty hunter.', response });
        }
    } catch (err) {
        console.error('Create bounty hunter error:', err);
        res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
    }
};

const updateBountyHunter = async (req, res) => {
    try {
        console.log('Update body:', req.body);
        
        if (!req.body || !req.body.name) {
            return res.status(400).json({ message: 'Request body is missing or invalid', body: req.body });
        }
        
        const userId = new ObjectId(req.params.id);
        const bountyHunter = {
            name: req.body.name,
            appearance: req.body.appearance,
            homeworld: req.body.homeworld,
            species: req.body.species,
            weapon: req.body.weapon,
            affiliation: req.body.affiliation
        };
        
        const response = await mongodb.getDb().collection('bountyhunters').replaceOne({ _id: userId }, bountyHunter);
        console.log('Update response:', response);
        
        if (response.modifiedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500).json({ message: 'Some error occurred while updating the bounty hunter.', response });
        }
    } catch (err) {
        console.error('Update bounty hunter error:', err);
        res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
    }
};

const deleteBountyHunter = async (req, res) => {
    try {
        const userId = new ObjectId(req.params.id);
        const response = await mongodb.getDb().collection('bountyhunters').deleteOne({ _id: userId });
        console.log('Delete response:', response);
        
        if (response.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500).json({ message: 'Some error occurred while deleting the bounty hunter.', response });
        }
    } catch (err) {
        console.error('Delete bounty hunter error:', err);
        res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
    }
};

module.exports = {
  getAll,
  getSingle,
  createBountyHunter,
  updateBountyHunter,
  deleteBountyHunter,
};