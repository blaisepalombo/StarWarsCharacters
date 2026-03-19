const express = require('express');
const router = express.Router();

router.use('/', require('./swagger'));
router.use('/forceusers', require('./forceusers'))
router.use('/rebelalliance', require('./rebelalliance'))
router.use('/empire', require('./empire'))
router.use('/bountyhunters', require('./bountyhunters'))

module.exports = router;