require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const userModel = require('../models/user.model');
const recordModel = require('../models/record.model');
const bcrypt = require('bcrypt');

async function run() {
  const dataDir = path.resolve(path.dirname(require.main.filename), '../../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  await userModel.createTableIfNotExists();
  await recordModel.createTableIfNotExists();

  // Seed users if none
  const adminEmail = 'admin@example.com';
  const existing = await userModel.findByEmail(adminEmail);
  if (!existing) {
    const hashed = await bcrypt.hash('password123', 10);
    await db('users').insert({ name: 'Admin', email: adminEmail, password: hashed, role: 'ADMIN' });
    await db('users').insert({ name: 'Analyst', email: 'analyst@example.com', password: hashed, role: 'ANALYST' });
    await db('users').insert({ name: 'Viewer', email: 'viewer@example.com', password: hashed, role: 'VIEWER' });
  }

  // Seed some financial records
  const users = await db('users').select('id');
  if ((await db('financial_records').count('* as cnt').first()).cnt === 0) {
    const now = new Date();
    const samples = [];
    const categories = ['Salary', 'Groceries', 'Utilities', 'Investment', 'Entertainment'];
    for (let i = 0; i < 30; i++) {
      const user = users[i % users.length];
      const type = i % 3 === 0 ? 'INCOME' : 'EXPENSE';
      const category = categories[i % categories.length];
      const date = new Date(now.getFullYear(), now.getMonth() - (i % 6), Math.max(1, 28 - (i % 20)));
      samples.push({ user_id: user.id, amount: (Math.random() * 1000 + 10).toFixed(2), type, category, date: date.toISOString().slice(0, 10), notes: 'Sample data' });
    }
    await db('financial_records').insert(samples);
  }

  console.log('Seed complete');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
