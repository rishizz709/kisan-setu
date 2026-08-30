const express = require('express');
const router = express.Router();
const requests = require('../controllers/requestController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/slots', requests.suggestSlot);
router.get('/', requests.list);
router.post('/', requests.create);
router.get('/:token/track', requests.track);
router.post('/:token/advance', requests.advance);

module.exports = router;
