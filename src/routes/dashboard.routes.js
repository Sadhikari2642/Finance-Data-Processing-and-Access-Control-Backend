const express = require('express');
const ctrl = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

// VIEWER, ANALYST, ADMIN can access dashboard summary
router.get('/summary', authorize(['VIEWER','ANALYST','ADMIN']), ctrl.summary);
router.get('/category-wise', authorize(['ANALYST','ADMIN']), ctrl.categoryWise);
router.get('/trends', authorize(['ANALYST','ADMIN']), ctrl.trends);
router.get('/recent', authorize(['ANALYST','ADMIN','VIEWER']), ctrl.recent);

module.exports = router;
