const router = require('express').Router();
const controller = require('../controllers/forceusers');

router.get('/', controller.getAll);
router.get('/:id', controller.getSingle);
router.post('/', controller.createForceUser);
router.put('/:id', controller.updateForceUser);
router.delete('/:id', controller.deleteForceUser);

module.exports = router;