import controller from '../controllers/budget.controller';
import fileUpload from 'express-fileupload';

const router = require('express').Router();

router.route('/').post(fileUpload(), controller.create);

router.route('/match/hkont').post(controller.matchHKONT);
router.route('/match/kostl').post(controller.matchKOSTL);

export default router;
