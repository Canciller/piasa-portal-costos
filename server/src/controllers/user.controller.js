import User from '../models/user.model';

import hashPassword from '../util/hashPassword';

import NotFoundError from '../util/error/NotFoundError';

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
      var password = await hashPassword(req.body.password);

      var user = new User(
        req.body.username,
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
  update: async (req, res, next) => {
    try {
      var username = req.user.username;
      var password = await hashPassword(req.body.password);

      var user = new User(
        req.body.username,
        req.body.email,
        password,
        true, // Ignored in update.
        req.body.role
      );

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
