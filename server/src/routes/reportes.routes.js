import authenticate from '../middleware/authenticate';
import controller from '../controllers/reportes.controller';

const router = require('express').Router();

router.route('/kostl').get(authenticate, controller.getKOSTL);

export default router;
