import hasAffectedRows from '../util/dbHasAffectedRows';
import queryResult from '../util/dbQueryResult';
import getPool from '../util/dbGetPool';
import hashPassword from '../util/hashPassword';

/**
 * User.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @param {string} status
 * @param {string} role
 */
var User = function (username, email, password, status, role) {
  this.username = username;
  this.email = email;
  this.password = password;
  this.role = role;
  this.status = status;
};

/**
 * Check if user is active.
 * @param {Object} user
 */
User.isActive = (user) => {
  return user && user.status === 'A';
};

/**
 * Create user.
 * @param {Object} user
 */
User.create = async (user) => {
  user.date = new Date(); // Current server date

  var hash = await hashPassword(user.password); // Hash password
  delete user.password;

  var pool = await getPool();
  var request = await pool
    .request()
    .input('username', user.username)
    .input('email', user.email)
    .input('password', hash)
    .input('role', user.role)
    .input('status', user.status)
    .input('date', user.date);

  var res = await request.query(`
      INSERT INTO users (username, email, password, status, role, date)
      VALUES (
        @username,
        @email,
        @password,
        @status,
        @role,
        @date
      )
    `);

  return queryResult(user, hasAffectedRows(res));
};

/**
 * Get user.
 * @param {string} username
 */
User.get = async (username) => {
  var pool = await getPool();
  var request = await pool.request().input('username', username);

  var res = await request.query(`
      SELECT * FROM users WHERE username = @username
    `);

  if (res.recordset && res.recordset.length !== 0) {
    return queryResult(res.recordset[0], true);
  } else {
    return queryResult(null, false);
  }
};

/**
 * Get all users.
 */
User.getAll = async () => {
  var pool = await getPool();
  var request = await pool.request();

  var res = await request.query(`
    SELECT
      username,
      email,
      status,
      role,
      date
    FROM users`);

  if (res.recordset && res.recordset.length !== 0) {
    return queryResult(res.recordset, true);
  } else {
    return queryResult([], true);
  }
};

/**
 * Change username.
 * @param {string} username
 * @param {string} newUsername
 */
User.changeUsername = async (username, newUsername) => {
  try {
    var pool = await getPool();
    var request = await pool
      .request()
      .input('username', username)
      .input('newUsername', newUsername);

    var res = await request.query(`
      UPDATE users SET
        username = @newUsername
      WHERE username = @username
    `);

    return queryResult({ username: newUsername }, hasAffectedRows(res));
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Change password.
 * @param {string} username
 * @param {string} password
 */
User.changePasword = async (username, password) => {
  var hash;
  if (password) {
    hash = await hashPassword(password); // Hash password
    password = undefined;
  }

  var pool = await getPool();
  var request = await pool
    .request()
    .input('username', username)
    .input('password', hash);

  var res = await request.query(`
      UPDATE users SET
        password = @password
      WHERE username = @username
    `);

  return queryResult({ username }, hasAffectedRows(res));
};

/**
 * Change email.
 * @param {string} username
 * @param {string} email
 */
User.changeEmail = async (username, email) => {
  var pool = await getPool();
  var request = await pool
    .request()
    .input('username', username)
    .input('email', email);

  var res = await request.query(`
      UPDATE users SET
        email = @email
      WHERE username = @username
    `);

  return queryResult({ username, email }, hasAffectedRows(res));
};

/**
 * Activate user.
 * @param {string} username
 */
User.activate = async (username) => {
  var pool = await getPool();
  var request = await pool.request().input('username', username);

  var res = await request.query(`
      UPDATE users SET
        status = 'A'
      WHERE username = @username
    `);

  var success = hasAffectedRows(res);
  return queryResult({ username, active: success }, success);
};

/**
 * Deactivate user.
 * @param {string} username
 */
User.deactivate = async (username) => {
  var pool = await getPool();
  var request = await pool.request().input('username', username);

  var res = await request.query(`
      UPDATE users SET
        status = NULL
      WHERE username = @username
    `);

  var success = hasAffectedRows(res);
  return queryResult({ username, active: !success }, success);
};

/**
 * Update user.
 * @param {string} username
 * @param {string} user
 */
User.update = async (username, user) => {
  var hash;
  if (user.password) {
    hash = await hashPassword(user.password); // Hash password
    delete user.password;
  }

  var pool = await getPool();
  var request = await pool
    .request()
    .input('username', username)
    .input('newUsername', newUsername)
    .input('email', user.email)
    .input('password', hash)
    .input('role', user.role)
    .input('status', user.status)
    .input('date', user.date);

  var res = await request.query(`
      UPDATE users SET
        username = @newUsername
        email = @email
        password = @password
        role = @role
        status = @status
      WHERE useranme = @username
    `);

  return queryResult(user, hasAffectedRows(res));
};

/**
 * Remove user.
 * @param {string} username
 */
User.remove = async (username) => {
  var pool = await getPool();
  var request = await pool.request().input('username', username);

  var res = await request.query(`
    DELETE FROM users WHERE username = @username
  `);

  return queryResult({ username }, hasAffectedRows(res));
};

export default User;
