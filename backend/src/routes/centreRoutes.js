const express = require('express');
const router = express.Router();
const centres = require('../controllers/centreController');

router.get('/', centres.list);
router.get('/recommend', centres.recommend);

module.exports = router;
