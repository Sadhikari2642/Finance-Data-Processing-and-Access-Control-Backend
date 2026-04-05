const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function register({ name, email, password, role = 'VIEWER' }) {
  const existing = await userModel.findByEmail(email);
  if (existing) throw { status: 400, message: 'Email already in use' };
  const hashed = await bcrypt.hash(password, 10);
  const user = await userModel.create({ name, email, password: hashed, role });
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function login({ email, password }) {
  const user = await userModel.findByEmail(email);
  if (!user) throw { status: 401, message: 'Invalid credentials' };
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };
  const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

module.exports = { register, login };
