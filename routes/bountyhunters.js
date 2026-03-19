const router = require('express').Router();
const controller = require('../controllers/bountyhunters');

router.get('/', controller.getAll);
router.get('/:id', controller.getSingle);
router.post('/', controller.createBountyHunter);
router.put('/:id', controller.updateBountyHunter);
router.delete('/:id', controller.deleteBountyHunter);

module.exports = router;