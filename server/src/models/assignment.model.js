import sql, { Table } from 'mssql';
import hasAffectedRows from '../util/dbHasAffectedRows';
import getPool from '../util/dbGetPool';
import log from '../util/log/error';
import { compareSync } from 'bcrypt';

/**
 * Class representing an Assignment.
 */
export default class Assignment {
  /**
   * Create tvp from assignments.
   * @param {Array} assignments
   */
  static createTable(assignments) {
    var tvp = new sql.Table();
    tvp.columns.add('username', sql.VarChar(30), {
      nullable: false,
    });
    tvp.columns.add('KOSTL', sql.Char(10), {
      nullable: false,
    });

    if (assignments instanceof Array)
      assignments.forEach((assignment) =>
        tvp.rows.add(assignment.username, assignment.kostl)
      );

    return tvp;
  }

  /**
   * Create new assignments in database.
   * @param {Array} assignments
   */
  static async create(assignments) {
    try {
      var tvp = Assignment.createTable(assignments);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('AssignmentsTable', sql.TVP('AssignmentsTableType'), tvp);

      await request.execute('insertManyAssignments');

      return assignments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove existing assignments from database.
   * @param {Array} assignments
   */
  static async remove(assignments) {
    try {
      var tvp = Assignment.createTable(assignments);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('AssignmentsTable', sql.TVP('AssignmentsTableType'), tvp);

      await request.execute('deleteManyAssignments');

      return assignments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if username has assignments.
   * @param {string} username
   */
  static async exists(username) {
    try {
      var pool = await getPool();
      var request = await pool
        .request()
        .input('username', sql.VarChar(30), username);

      var res = await request.query(`
        SELECT 1 FROM assignments WHERE username = @username
      `);

      if (res.recordset && res.recordset.length !== 0) return true;

      return false;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get assignments of username from database.
   * @param {string} username
   */
  static async get(username) {
    try {
      var pool = await getPool();
      var request = await pool
        .request()
        .input('username', sql.VarChar(30), username);

      var res = await request.query(`
        SELECT * FROM assignments WHERE username = @username
      `);

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all assignments from database.
   */
  static async getAll() {
    try {
      var pool = await getPool();
      var request = await pool.request();

      var res = await request.query(`SELECT * FROM assignments`);

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }
}
