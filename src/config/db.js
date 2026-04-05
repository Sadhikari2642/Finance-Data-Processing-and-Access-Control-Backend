const knex = require('knex');
const path = require('path');

const dbPath = process.env.DB_PATH || './data/dev.sqlite3';

const knexConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.resolve(dbPath),
  },
  useNullAsDefault: true,
};

const db = knex(knexConfig);

module.exports = db;
