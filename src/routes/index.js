const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/records', require('./records.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
