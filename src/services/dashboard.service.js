const db = require('../config/db');

async function summary() {
  const incomeQ = db('financial_records').where({ is_deleted: false, type: 'INCOME' }).sum('amount as total').first();
  const expenseQ = db('financial_records').where({ is_deleted: false, type: 'EXPENSE' }).sum('amount as total').first();
  const [inc, exp] = await Promise.all([incomeQ, expenseQ]);
  const totalIncome = Number(inc.total || 0);
  const totalExpenses = Number(exp.total || 0);
  return { totalIncome, totalExpenses, net: totalIncome - totalExpenses };
}

async function categoryWise() {
  return db('financial_records')
    .where({ is_deleted: false })
    .select('category')
    .sum('amount as total')
    .groupBy('category')
    .orderBy('total', 'desc');
}

async function trends() {
  return db('financial_records')
    .where({ is_deleted: false })
    .select(db.raw("strftime('%Y-%m', date) as month"))
    .sum('amount as total')
    .groupBy('month')
    .orderBy('month', 'asc');
}

async function recent(limit = 5) {
  return db('financial_records')
    .where({ is_deleted: false })
    .select('*')
    .orderBy('date', 'desc')
    .limit(limit);
}

module.exports = { summary, categoryWise, trends, recent };
