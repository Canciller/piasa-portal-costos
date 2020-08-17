import User from '../models/user.model';

import hashPassword from '../util/hashPassword';

import NotFoundError from '../util/error/NotFoundError';
import ForbiddenError from '../util/error/ForbiddenError';

export default {
  load: async (req, res, next, username) => {
    try {
      var user = await User.get(username);

      if (user) {
        req.user = user;
        return next();
      }

      throw new NotFoundError();
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      if(!req.body.username || req.body.username === '')
        throw new ForbiddenError;
      // TODO: Remove this, create secure random password
      //       and send them through email.
      var password = 'password';
      if (req.body.password !== undefined)
        password = await hashPassword(req.body.password);

      var user = new User(
        req.body.username,
        req.body.name,
        req.body.email,
        password,
        req.body.isActive,
        req.body.role
      );

      var created = await User.create(user);
      return res.json(created);
    } catch (error) {
      next(error);
    }
  },
  activate: async (req, res, next) => {
    try {
      var username = req.user.username;
      var activated = await User.activate(username);
      return res.json(activated);
    } catch (error) {
      next(error);
    }
  },
  deactivate: async (req, res, next) => {
    try {
      var username = req.user.username;
      var deactivated = await User.deactivate(username);
      return res.json(deactivated);
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      var username = req.user.username;
      var password;
      if (req.body.password !== undefined)
        password = await hashPassword(req.body.password);

      var user = new User();
      user.username = req.body.username;
      user.name = req.body.name;
      user.email = req.body.email;
      user.password = password;
      user.role = req.body.role;

      var updated = await User.update(username, user);
      delete updated.password;
      return res.json(updated);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      var username = req.user.username;
      var removed = await User.remove(username);
      return res.json(removed);
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res) => {
    delete req.user.password;
    return res.json(req.user);
  },
  getAll: async (req, res, next) => {
    try {
      var users = await User.getAll();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  },
};
