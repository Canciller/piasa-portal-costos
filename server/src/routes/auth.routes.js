import authenticate from '../middleware/authenticate';
import controller from '../controllers/auth.controller';

const router = require('express').Router();

router.route('/login').post(controller.login);

router.route('/logout').get(controller.logout);

router.route('/me').get(authenticate, (req, res) => res.json(req.user));

/*
router.route('/forgot/username').post(controller.forgotUsername);

router.route('/forgot/email').post(controller.forgotEmail);

router.route('/forgot/password').post(controller.forgotPassword);
*/

export default router;
