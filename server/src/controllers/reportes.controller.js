import ValidationError from '../util/error/ValidationError';
import UnauthorizedError from '../util/error/UnauthorizedError';
import Assignment from '../models/assignment.model';

export default {
  getKOSTL: async function (req, res, next) {
    try {
      var assignments = await Assignment.getLinked(req.user.username);
      return res.json(assignments);
    } catch (error) {
      next(error);
    }
  },
};
