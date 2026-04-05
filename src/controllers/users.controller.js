const userService = require('../services/user.service');

async function list(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await userService.listUsers({ page: Number(page), limit: Number(limit) });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await userService.createUser(req.body);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function patch(req, res, next) {
  try {
    const data = await userService.updateUser(req.params.id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, patch, remove };
