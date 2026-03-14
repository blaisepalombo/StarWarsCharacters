const router = require('express').Router();

router.get('/', (req, res) => {
  res.send('Star Wars Character Database API');
});

router.use('/characters', require('./characters'));

module.exports = router;