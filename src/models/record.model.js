const db = require('../config/db');

const TABLE = 'financial_records';

async function createTableIfNotExists() {
  const exists = await db.schema.hasTable(TABLE);
  if (!exists) {
    await db.schema.createTable(TABLE, (t) => {
      t.increments('id').primary();
      t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.decimal('amount', 14, 2).notNullable();
      t.string('type').notNullable();
      t.string('category').notNullable();
      t.date('date').notNullable();
      t.text('notes');
      t.timestamp('created_at').defaultTo(db.fn.now());
      t.boolean('is_deleted').defaultTo(false);
    });
  }
}

function create(record) {
  return db(TABLE).insert(record).then(([id]) => db(TABLE).where({ id }).first());
}

function findById(id) {
  return db(TABLE).where({ id, is_deleted: false }).first();
}

function update(id, patch) {
  return db(TABLE).where({ id }).update(patch);
}

function softDelete(id) {
  return db(TABLE).where({ id }).update({ is_deleted: true });
}

function query(filters = {}, { page = 1, limit = 20 } = {}) {
  const q = db(TABLE).where({ is_deleted: false });
  if (filters.type) q.andWhere('type', filters.type);
  if (filters.category) q.andWhere('category', filters.category);
  if (filters.startDate) q.andWhere('date', '>=', filters.startDate);
  if (filters.endDate) q.andWhere('date', '<=', filters.endDate);
  const offset = (page - 1) * limit;
  return q.select('*').limit(limit).offset(offset).orderBy('date', 'desc');
}

module.exports = {
  createTableIfNotExists,
  create,
  findById,
  update,
  softDelete,
  query,
};
