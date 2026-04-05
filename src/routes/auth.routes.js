const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
], ctrl.register);

router.post('/login', [
  body('email').isEmail(),
  body('password').exists(),
], ctrl.login);

module.exports = router;
