import Assignment from '../models/assignment.model';
import NotFoundError from '../util/error/NotFoundError';

export default {
  load: async (req, res, next, username) => {
    req.username = username;
    next();
  },
  create: async (req, res, next) => {
    try {
      var created = await Assignment.create(req.body);
      return res.json(created);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      var deleted = await Assignment.remove(req.body);
      return res.json(deleted);
    } catch (error) {
      next(error);
    }
  },
  exists: async (req, res, next) => {
    try {
      var found = await Assignment.exists(req.username);

      if (found) return res.sendStatus(200);
      return res.sendStatus(404);
    } catch (error) {
      next(error);
    }
  },
  get: async (req, res) => {
    try {
      var all = await Assignment.get(req.username);

      if (all) return res.json(all);

      throw new NotFoundError();
    } catch (error) {
      next(error);
    }
  },
  getAll: async (req, res, next) => {
    try {
      var all = await Assignment.getAll();
      return res.json(all);
    } catch (error) {
      next(error);
    }
  },
};
