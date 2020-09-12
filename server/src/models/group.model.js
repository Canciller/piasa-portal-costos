import sql, { Table } from 'mssql';
import createGroupTable from '../util/createGroupTable';
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
    tvp.columns.add('GRUPO', sql.Char(30), {
      nullable: false,
    });

    if (assignments instanceof Array)
      assignments.forEach((assignment) =>
        tvp.rows.add(
          assignment.username,
          String(assignment.group).substr(0, 30)
        )
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
      //console.log(tvp.rows);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('AssignmentsTable', sql.TVP('GroupAssignmentsTableType'), tvp);

      await request.execute('insertManyGroupAssignments');

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
        .input('AssignmentsTable', sql.TVP('GroupAssignmentsTableType'), tvp);

      await request.execute('deleteManyGroupAssignments');

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
        SELECT 1 FROM group_assignments WHERE username = @username
      `);

      if (res.recordset && res.recordset.length !== 0) return true;

      return false;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get KOSTL linked to username from database.
   * @param {string} username
   */
  static async getLinked(username) {
    try {
      var pool = await getPool();
      var request = await pool
        .request()
        .input('username', sql.VarChar(30), username);

      var res = await request.execute('getLinkedGroupAssignments');

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get KOSTL not linked to username from database.
   * @param {string} username
   */
  static async getUnlinked(username) {
    try {
      var pool = await getPool();
      var request = await pool
        .request()
        .input('username', sql.VarChar(30), username);

      var res = await request.execute('getUnlinkedGroupAssignments');

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

      var res = await request.query(`SELECT * FROM group_assignments`);

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Match KOSTLs of username with Array of KOSTLs.
   * @param {string} username
   * @param {Array} groups
   */
  static async matchGroup(username, groups) {
    try {
      if (!(groups instanceof Array)) return false;

      var tvp = createGroupTable(groups);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('username', sql.VarChar(30), username)
        .input('GRUPOTable', sql.TVP('GRUPOTableType'), tvp);

      var res = await request.execute('matchAssignmentsGRUPOS');

      if (res.recordset && res.recordset.length !== 0)
        return res.recordset.length === groups.length;

      return false;
    } catch (error) {
      throw error;
    }
  }
}
