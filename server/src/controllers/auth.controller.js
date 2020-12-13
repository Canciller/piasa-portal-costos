import User from '../models/user.model';

import UnauthorizedError from '../util/error/UnauthorizedError';
import ForbiddenError from '../util/error/ForbiddenError';

import signToken from '../util/signToken';
import comparePassword from '../util/comparePassword';
import hashPassword from '../util/hashPassword';
import isEmail from '../util/validateEmail';

import jwtConfig from '../config/jwt';

function getJwtCookieOptions() {
  var month = new Date();
  month.setMonth(month.getMonth() + 1);

  return { httpOnly: true, expires: month, secure: jwtConfig.secure, path: jwtConfig.path };
}

export default {
  login: async (req, res, next) => {
    try {
      var username = req.body.username,
        password = req.body.password;

      var user;
      if (isEmail(username)) user = await User.getByEmail(username);
      else user = await User.get(username);

      if (!user) throw new UnauthorizedError();
      if (!user.isActive) throw new ForbiddenError();

      var validCredentials = await comparePassword(password, user.password);
      if (!validCredentials) throw new UnauthorizedError();

      var token = signToken(user);

      var month = new Date();
      month.setMonth(month.getMonth() + 1);
      res.cookie('token', token, getJwtCookieOptions());

      return res.json({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (error) {
      res.clearCookie('token'); // Clear token on error.

      next(error);
    }
  },
  logout: async (req, res) => {
    const opts = getJwtCookieOptions();

    return res.clearCookie('token', {
      path: opts.path,
      secure: opts.secure
    }).json({});
  },
  changeUser: async (req, res, next) => {
    try {
      var username = req.body.username,
        email = req.body.email,
        name = req.body.name;

      var oldUsername = req.user.username;

      var user = await User.changeUser(
        oldUsername,
        new User(username, name, email)
      );

      var token = signToken(user);

      var month = new Date();
      month.setMonth(month.getMonth() + 1);
      res.cookie('token', token, getJwtCookieOptions());

      return res.json({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      });
    } catch (error) {
      next(error);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      var oldPassword = req.body.oldPassword,
        password = req.body.password,
        passwordRepeat = req.body.passwordRepeat;

      if (password !== passwordRepeat)
        throw new UnauthorizedError('Las contraseñas no coinciden.');

      var username = req.user.username;
      var user = await User.get(username);

      if (!user) throw new ForbiddenError();

      var validCredentials = await comparePassword(oldPassword, user.password);
      if (!validCredentials)
        throw new UnauthorizedError('La contraseña actual es incorrecta.');

      password = await hashPassword(password);

      await User.changePassword(username, password);

      return res.json({});
    } catch (error) {
      next(error);
    }
  },
};
