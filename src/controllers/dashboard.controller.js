const dashboardService = require('../services/dashboard.service');

async function summary(req, res, next) {
  try {
    const data = await dashboardService.summary();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function categoryWise(req, res, next) {
  try {
    const data = await dashboardService.categoryWise();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function trends(req, res, next) {
  try {
    const data = await dashboardService.trends();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function recent(req, res, next) {
  try {
    const data = await dashboardService.recent();
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, categoryWise, trends, recent };
