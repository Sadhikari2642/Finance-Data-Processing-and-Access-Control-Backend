const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/records.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize(['ADMIN']), [
  body('amount').isFloat({ gt: 0 }),
  body('type').isIn(['INCOME', 'EXPENSE']),
  body('category').isString().notEmpty(),
  body('date').isISO8601(),
], ctrl.create);

router.get('/', authorize(['ADMIN','ANALYST']), ctrl.list);
router.get('/:id', authorize(['ADMIN','ANALYST']), ctrl.get);
router.patch('/:id', authorize(['ADMIN']), ctrl.patch);
router.delete('/:id', authorize(['ADMIN']), ctrl.remove);

module.exports = router;
