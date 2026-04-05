const recordService = require('../services/record.service');

async function create(req, res, next) {
  try {
    const payload = Object.assign({}, req.body, { user_id: req.user.id });
    const data = await recordService.createRecord(payload);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const data = await recordService.queryRecords(filters, { page, limit });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const data = await recordService.getRecord(req.params.id);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function patch(req, res, next) {
  try {
    const data = await recordService.updateRecord(req.params.id, req.body);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await recordService.deleteRecord(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, get, patch, remove };
