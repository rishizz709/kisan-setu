const express = require('express');
const router = express.Router();
const crops = require('../controllers/cropController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', crops.list);
router.post('/', crops.create);
router.delete('/:id', crops.remove);

module.exports = router;
