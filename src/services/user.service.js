const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');

async function listUsers({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  return userModel.list({ limit, offset });
}

async function createUser(payload) {
  if (payload.password) payload.password = await bcrypt.hash(payload.password, 10);
  return userModel.create(payload);
}

async function updateUser(id, patch) {
  if (patch.password) patch.password = await bcrypt.hash(patch.password, 10);
  await userModel.update(id, patch);
  return userModel.findById(id);
}

async function deleteUser(id) {
  return userModel.remove(id);
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
