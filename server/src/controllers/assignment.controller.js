import Assignment from '../models/assignment.model';
import NotFoundError from '../util/error/NotFoundError';

export default {
  load: async (req, res, next, username) => {
    req.username = username;
    next();
  },
  create: async (req, res, next) => {
    try {
      if (req.body.length === 0) return res.json([]);

      var created = await Assignment.create(req.body);
      return res.json(created);
    } catch (error) {
      next(error);
    }
  },
  remove: async (req, res, next) => {
    try {
      if (req.body.length === 0) return res.json([]);

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
  getLinked: async (req, res, next) => {
    try {
      var linked = await Assignment.getLinked(req.username);

      return res.json(linked);
    } catch (error) {
      next(error);
    }
  },
  getUnlinked: async (req, res, next) => {
    try {
      var unlinked = await Assignment.getUnlinked(req.username);

      return res.json(unlinked);
    } catch (error) {
      next(error);
    }
  },
  getLinkedAndUnlinked: async (req, res, next) => {
    try {
      var linked = await Assignment.getLinked(req.username),
        unlinked = await Assignment.getUnlinked(req.username);

      return res.json(linked.concat(unlinked));
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
  matchKOSTL: async (req, res, next) => {
    try {
      var match = Assignment.matchKOSTL(req.body.username, req.body.kostl);
      return res.json(match);
    } catch (error) {
      next(error);
    }
  },
};
