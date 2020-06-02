const express = require('express');
const router = express.Router();

const leader_controller = require('../controllers/leader_controller');

router.get('/:leader', leader_controller.dispLeader);

module.exports = router;
