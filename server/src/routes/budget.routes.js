import controller from '../controllers/budget.controller';

const router = require('express').Router();

router.route('/').post(controller.create);

router.route('/match/hkont').post(controller.matchHKONT);
router.route('/match/kostl').post(controller.matchKOSTL);

export default router;
