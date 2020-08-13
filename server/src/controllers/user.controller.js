import NotFound from '../util/error/NotFound';
import User from '../models/user.model';

var controller = {};

/**
 * Load user in request by username.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @param {string} username
 */
controller.load = async (req, res, next, username) => {
  try {
    var result = await User.get(username);

    if (result.success) {
      delete result.data.password;
      req.user = result.data;
      next();
    } else {
      throw new NotFound(`User with username '${username}' was not found`);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Create user.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
controller.create = async (req, res, next) => {
  try {
    var user = new User(
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.status,
      req.body.role
    );

    var result = await User.create(user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
controller.getAll = async (req, res, next) => {
  try {
    var result = await User.getAll();
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user loaded from request.
 * @param {Request} req
 * @param {Response} res
 */
controller.get = (req, res) => {
  return res.json({
    success: true,
    data: req.user,
  });
};

/**
 * Update user by username.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
controller.update = async (req, res, next) => {
  try {
    var user = new User(
      req.body.username,
      req.body.email,
      req.body.password,
      req.body.status,
      req.body.role
    );

    var result = await User.update(user);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove user by username.
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
controller.remove = async (req, res, next) => {
  try {
    var result = await User.remove(req.user.username);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export default controller;
