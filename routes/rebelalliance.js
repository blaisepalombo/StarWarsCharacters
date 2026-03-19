const router = require('express').Router();
const controller = require('../controllers/rebelalliance');

router.get('/', controller.getAll);
router.get('/:id', controller.getSingle);
router.post('/', controller.createRebel);
router.put('/:id', controller.updateRebel);
router.delete('/:id', controller.deleteRebel);

module.exports = router;