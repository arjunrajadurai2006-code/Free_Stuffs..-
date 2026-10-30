const express = require('express');
const router = express.Router();
const { checkPincode } = require('../controllers/pincode.controller');

router.get('/check', checkPincode);

module.exports = router;

