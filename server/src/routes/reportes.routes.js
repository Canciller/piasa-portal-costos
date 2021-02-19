import authenticate from '../middleware/authenticate';
import controller from '../controllers/reportes.controller';

const router = require('express').Router();

router.route('/kostl').get(authenticate, controller.getKOSTL);
router.route('/params').get(authenticate, controller.getParams);
router
  .route('/params/filtered')
  .post(authenticate, controller.getParamsFiltered);

router.route('/1').post(authenticate, controller.getReporte1);
router.route('/1/real').post(authenticate, controller.getReporte1Detail);
router.route('/1/budget').post(
  authenticate,
  (req, res, next) => {
    req.isBudget = true;
    next();
  },
  controller.getReporte1Detail
);
router.route('/1/realAccum').post(authenticate, controller.getReporte1DetailRealAccum);

router.route('/2').post(authenticate, controller.getReporte2);

export default router;
