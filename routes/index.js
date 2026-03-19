const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('Star Wars Character Database API');
});

router.use('/characters', require('./characters'));
router.use('/planets', require('./planets'));
router.use('/starships', require('./starships'));
router.use('/factions', require('./factions'));

module.exports = router;