const router = require('express').Router();
const controller = require('../controllers/empire');

router.get('/', controller.getAll);
router.get('/:id', controller.getSingle);
router.post('/', controller.createEmpire);
router.put('/:id', controller.updateEmpire);
router.delete('/:id', controller.deleteEmpire);

module.exports = router;