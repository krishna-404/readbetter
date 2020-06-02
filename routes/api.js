const express = require('express');
const router = express.Router();

const leader_controller = require('../controllers/leader_controller');

router.get('/leader_data/:twitter_id', leader_controller.dispLeader);
router.post('/leader_data/:twitter_id', leader_controller.newLeader);

module.exports = router;
