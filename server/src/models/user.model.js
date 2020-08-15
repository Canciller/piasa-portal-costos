import sql, { Table } from 'mssql';
import hasAffectedRows from '../util/dbHasAffectedRows';
import queryResult from '../util/dbQueryResult';
import getPool from '../util/dbGetPool';
import hashPassword from '../util/hashPassword';
import log from '../util/log/error';

/**
 * Class representing a User.
 */
export default class User {
  /**
   * Create a User.
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {boolean} isActive
   * @param {string} role
   */
  constructor(username, name, email, password, isActive, role) {
    this.username = username;
    this.name = name;
    this.password = password;
    this.isActive = isActive;
    this.email = email;
    this.role = role;
    this.createdAt = new Date();
    this.updatedAt = this.createdAt;
  }

  toJSON() {
    return {
      username: this.username,
      name: this.name,
      password: this.password,
      email: this.email,
      isActive: this.isActive,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Create request and add inputs.
   * @param {string} username
   */
  async request(username) {
    this.updatedAt = new Date();

    var pool = await getPool();
    return await pool
      .request()
      .input('username', sql.VarChar(80), this.username)
      .input('name', sql.VarChar(50), this.name)
      .input('email', sql.VarChar(254), this.email)
      .input('password', sql.VarChar(80), this.password)
      .input('role', this.role)
      .input('status', this.isActive ? 'A' : 'U')
      .input('createdAt', sql.DateTime, this.createdAt)
      .input('updatedAt', sql.DateTime, this.updatedAt)
      .input('current', username);
  }

  /**
   * Create new user in database.
   * @param {User} user
   */
  static async create(user) {
    try {
      var request = await user.request();
      var res = await request.query(`
        INSERT INTO users (username, name, email, password, status, role, createdAt, updatedAt)
        VALUES (
          @username,
          @name,
          @email,
          @password,
          @status,
          @role,
          @createdAt,
          @createdAt
        )
      `);

      if (hasAffectedRows(res)) {
        var createdUser = user.toJSON();
        delete createdUser.password;
        return createdUser;
      }
      throw new Error('Error creating user');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update existing user from database by username.
   * @param {string} username
   * @param {Object} data
   */
  static async update(username, data) {
    try {
      var user = new User();
      user.username = data.username || username;
      user.name = data.name;
      user.email = data.email;
      user.password = data.password;
      user.role = data.role;

      var request = await user.request(username);
      var res = await request.query(`
        UPDATE users SET
          username = IsNull(@username, username),
          name = IsNull(@name, name),
          email = IsNull(@email, email),
          password = IsNull(@password, password),
          role = IsNull(@role, role),
          updatedAt = @updatedAt
        WHERE username = @current
      `);

      if (hasAffectedRows(res)) {
        var updatedUser = await User.get(data.username || username);
        return updatedUser;
      }

      throw new Error('Error updating user');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove existing user from database by username.
   * @param {string} username
   */
  static async remove(username) {
    try {
      var pool = await getPool();
      var request = await pool.request().input('username', username);

      var res = await request.query(`
        DELETE FROM users WHERE username = @username
      `);

      if (hasAffectedRows(res))
        return {
          username,
        };

      throw new Error('Error removing user');
    } catch (error) {
      log(error);

      throw error;
    }
  }

  /**
   * Get user from database by username.
   * @param {string} username
   */
  static async get(username) {
    try {
      var pool = await getPool();
      var request = await pool.request().input('username', username);

      var res = await request.query(`
        SELECT * FROM users WHERE username = @username
      `);

      if (res.recordset && res.recordset.length !== 0) {
        var user = {
          ...res.recordset[0],
        };

        //delete user.password;

        user.isActive = user.status === 'A';
        delete user.status;

        return user;
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user from database by email.
   * @param {string} email
   */
  static async getByEmail(email) {
    try {
      var pool = await getPool();
      var request = await pool.request().input('email', email);

      var res = await request.query(`
        SELECT * FROM users WHERE email = @email
      `);

      if (res.recordset && res.recordset.length !== 0) {
        var user = {
          ...res.recordset[0],
        };

        //delete user.password;

        user.isActive = user.status === 'A';
        delete user.status;

        return user;
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users from database.
   */
  static async getAll() {
    try {
      var pool = await getPool();
      var request = await pool.request();

      var res = await request.query(`
      SELECT
        username,
        name,
        email,
        status,
        role,
        createdAt,
        updatedAt
      FROM users`);

      if (res.recordset && res.recordset.length !== 0) {
        res.recordset.forEach((user) => {
          user.isActive = user.status === 'A';
          delete user.status;
        });

        return res.recordset;
      }

      return [];
    } catch (error) {
      throw error;
    }
  }
}
