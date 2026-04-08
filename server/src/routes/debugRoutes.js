const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

router.post('/debug-code', debugController.debugCode);

module.exports = router;
