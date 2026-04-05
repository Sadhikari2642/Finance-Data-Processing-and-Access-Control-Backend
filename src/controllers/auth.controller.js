const { validationResult } = require('express-validator');
const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const data = await authService.register(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const data = await authService.login(req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
