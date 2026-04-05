const recordModel = require('../models/record.model');

async function createRecord(payload) {
  if (!payload.amount || Number(payload.amount) <= 0) throw { status: 400, message: 'Amount must be positive' };
  if (!['INCOME', 'EXPENSE'].includes(payload.type)) throw { status: 400, message: 'Type must be INCOME or EXPENSE' };
  return recordModel.create(payload);
}

async function getRecord(id) {
  const rec = await recordModel.findById(id);
  if (!rec) throw { status: 404, message: 'Record not found' };
  return rec;
}

async function updateRecord(id, patch) {
  if (patch.amount && Number(patch.amount) <= 0) throw { status: 400, message: 'Amount must be positive' };
  if (patch.type && !['INCOME', 'EXPENSE'].includes(patch.type)) throw { status: 400, message: 'Type must be INCOME or EXPENSE' };
  await recordModel.update(id, patch);
  return recordModel.findById(id);
}

async function deleteRecord(id) {
  return recordModel.softDelete(id);
}

async function queryRecords(filters, pagination) {
  return recordModel.query(filters, pagination);
}

module.exports = { createRecord, getRecord, updateRecord, deleteRecord, queryRecords };
