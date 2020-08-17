import User from '../models/user.model';

import UnauthorizedError from '../util/error/UnauthorizedError';
import ForbiddenError from '../util/error/ForbiddenError';

import signToken from '../util/signToken';
import comparePassword from '../util/comparePassword';
import isEmail from '../util/validateEmail';

export default {
  login: async (req, res, next) => {
    try {
      var username = req.body.username,
        password = req.body.password;

      var user;
      if (isEmail(username)) user = await User.getByEmail(username);
      else user = await User.get(username);

      if (!user || !user.isActive) throw new UnauthorizedError();

      var validCredentials = await comparePassword(password, user.password);
      if (!validCredentials) throw new UnauthorizedError();

      var token = signToken(user);

      var month = new Date();
      month.setMonth(month.getMonth() + 1);
      res.cookie('token', token, { httpOnly: true, expires: month });
      return res.json({
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        //token,
      });
    } catch (error) {
      res.clearCookie('token'); // Clear token on error.

      next(error);
    }
  },
  logout: async (req, res) => {
    return res.clearCookie('token').sendStatus(200);
  },
};
