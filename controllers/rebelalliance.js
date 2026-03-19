const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;

const getAll = (req, res, next) => {
  mongodb.getDb().collection('rebelalliance').find().toArray().then((lists) => {
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
    .collection('rebelalliance')
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

const createRebel = async (req, res) => {
    try {
        console.log('Received body:', req.body);
        
        if (!req.body || !req.body.name) {
            return res.status(400).json({ message: 'Request body is missing or invalid', body: req.body });
        }
        
        const rebel = {
            name: req.body.name,
            appearance: req.body.appearance,
            homeworld: req.body.homeworld,
            species: req.body.species,
            weapon: req.body.weapon,
            affiliation: req.body.affiliation,
        };
        
        const response = await mongodb.getDb().collection('rebelalliance').insertOne(rebel);
        console.log('Insert response:', response);
        
        if (response.acknowledged) {
            res.status(201).json(response); 
        } else {
            res.status(500).json({ message: 'Some error occurred while creating the rebel.', response });
        }
    } catch (err) {
        console.error('Create rebel error:', err);
        res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
    }
};

const updateRebel = async (req, res) => {
    try {
        console.log('Update body:', req.body);
        
        if (!req.body || !req.body.name) {
            return res.status(400).json({ message: 'Request body is missing or invalid', body: req.body });
        }
        
        const userId = new ObjectId(req.params.id);
        const rebel = {
            name: req.body.name,
            appearance: req.body.appearance,
            homeworld: req.body.homeworld,
            species: req.body.species,
            weapon: req.body.weapon,
            affiliation: req.body.affiliation
        };
        
        const response = await mongodb.getDb().collection('rebelalliance').replaceOne({ _id: userId }, rebel);
        console.log('Update response:', response);
        
        if (response.modifiedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500).json({ message: 'Some error occurred while updating the rebel.', response });
        }
    } catch (err) {
        console.error('Update rebel error:', err);
        res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
    }
};

const deleteRebel = async (req, res) => {
    try {
        const userId = new ObjectId(req.params.id);
        const response = await mongodb.getDb().collection('rebelalliance').deleteOne({ _id: userId });
        console.log('Delete response:', response);
        
        if (response.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500).json({ message: 'Some error occurred while deleting the rebel.', response });
        }
    } catch (err) {
        console.error('Delete rebel error:', err);
        res.status(500).json({ message: err.message, stack: err.stack, name: err.name });
    }
};

module.exports = {
  getAll,
  getSingle,
  createRebel,
  updateRebel,
  deleteRebel,
};