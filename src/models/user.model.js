const db = require('../config/db');

const TABLE = 'users';

async function createTableIfNotExists() {
  const exists = await db.schema.hasTable(TABLE);
  if (!exists) {
    await db.schema.createTable(TABLE, (t) => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('email').notNullable().unique();
      t.string('password').notNullable();
      t.string('role').notNullable().defaultTo('VIEWER');
      t.string('status').notNullable().defaultTo('active');
      t.timestamp('created_at').defaultTo(db.fn.now());
    });
  }
}

async function create(user) {
  const [id] = await db(TABLE).insert(user);
  return findById(id);
}

function findByEmail(email) {
  return db(TABLE).where({ email }).first();
}

function findById(id) {
  return db(TABLE).where({ id }).first();
}

function list({ limit = 50, offset = 0 } = {}) {
  return db(TABLE).select('id', 'name', 'email', 'role', 'status', 'created_at').limit(limit).offset(offset);
}

function update(id, patch) {
  return db(TABLE).where({ id }).update(patch);
}

function remove(id) {
  return db(TABLE).where({ id }).del();
}

module.exports = {
  createTableIfNotExists,
  create,
  findByEmail,
  findById,
  list,
  update,
  remove,
};
