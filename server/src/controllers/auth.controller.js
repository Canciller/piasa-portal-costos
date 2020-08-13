import User from '../models/user.model';
import UnauthorizedError from '../util/error/UnauthorizedError';
import ForbiddenError from '../util/error/Forbidden';
import comparePassword from '../util/comparePassword';
import jsonwebtoken from 'jsonwebtoken';

require('dotenv').config();

var controller = {};

controller.login = (req, res, next) => {
  var user;
  const username = req.body.username;
  const password = req.body.password;

  const IncorrectUsernameOrPassword = new UnauthorizedError(
    'Username or password is incorrect'
  );

  User.get(username)
    .then((result) => {
      user = result.data;
      if (result.success) {
        if (!User.isActive(user))
          throw new ForbiddenError('User is not active');
        return comparePassword(password, user.password);
      } else {
        throw IncorrectUsernameOrPassword;
      }
    })
    .then((result) => {
      if (result === true) {
        const token = jsonwebtoken.sign(
          {
            username: user.username,
            role: user.role,
          },
          process.env.SECRET,
          {
            algorithm: 'HS256',
          }
        );

        res.cookie('token', token, { httpOnly: true });
        res.json({
          success: true,
          token,
          data: {
            username: user.username,
            role: user.role,
          },
        });
      } else {
        throw IncorrectUsernameOrPassword;
      }
    })
    .catch(error => {
      res.clearCookie('token');
      next(error);
    });
};

controller.logout = (req, res, next) => {
  return res.clearCookie('token').sendStatus(200);
};

/*
controller.forgotPassword = async (req, res, next) => {};

controller.forgotUsername = async (req, res, next) => {};

controller.forgotEmail = async (req, res, next) => {};
*/

export default controller;
