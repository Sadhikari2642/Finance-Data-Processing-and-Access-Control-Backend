const express = require('express');
const { body } = require('express-validator');
const ctrl = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(['ADMIN']), ctrl.list);
router.post('/', authorize(['ADMIN']), [
  body('name').isString().notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['VIEWER', 'ANALYST', 'ADMIN']).optional(),
], ctrl.create);

router.patch('/:id', authorize(['ADMIN']), ctrl.patch);
router.delete('/:id', authorize(['ADMIN']), ctrl.remove);

module.exports = router;
