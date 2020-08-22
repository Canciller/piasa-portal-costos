import controller from '../controllers/budget.controller';

const router = require('express').Router();

router.route('/').post(controller.create);

export default router;
