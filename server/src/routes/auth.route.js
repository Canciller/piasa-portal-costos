import jwt from 'express-jwt';
import controller from '../controllers/auth.controller';

const router = require('express').Router();

router.route('/login').post(controller.login);

router.route('/logout').get(controller.logout);

router.route('/me').get(
  jwt({
    secret: process.env.SECRET,
    algorithms: ['HS256'],
    getToken: (req) => req.cookies.token,
  }),
  (req, res, next) => {
    return res.status(200).json({
      success: true,
      data: req.user,
    });
  }
);

/*
router.route('/forgot/username').post(controller.forgotUsername);

router.route('/forgot/email').post(controller.forgotEmail);

router.route('/forgot/password').post(controller.forgotPassword);
*/

export default router;
