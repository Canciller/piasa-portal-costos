import authenticate from '../middleware/authenticate';
import controller from '../controllers/reportes.controller';

const router = require('express').Router();

router.route('/kostl').get(authenticate, controller.getKOSTL);

router.route('/1').post(authenticate, controller.getReporte1);
router.route('/1/detail').post(authenticate, controller.getReporte1Detail);

export default router;
