import sql, { Table } from 'mssql';
import hasAffectedRows from '../util/dbHasAffectedRows';
import getPool from '../util/dbGetPool';
import log from '../util/log/error';
import { compareSync } from 'bcrypt';

/**
 * Class representing a Budget.
 */
export default class Budget {
  /**
   * Create tvp from budget.
   * @param {Array} budget
   */
  static createTable(budget) {
    var tvp = new sql.Table();
    tvp.columns.add('HKONT', sql.Char(10), {
      nullable: false,
    });
    tvp.columns.add('KOSTL', sql.Char(10), {
      nullable: false,
    });
    tvp.columns.add('GJAHR', sql.Char(4), {
      nullable: false,
    });
    tvp.columns.add('PERIOD', sql.Char(2), {
      nullable: false,
    });
    tvp.columns.add('DMBTR', sql.Money, {
      nullable: false,
    });

    if (budget instanceof Array)
      budget.forEach((row) =>
        tvp.rows.add(row.HKONT, row.KOSTL, row.GJAHR, row.PERIOD, row.DMBTR)
      );

    return tvp;
  }

  static padZeros(str) {
    var value = typeof str === 'string' ? str : String(str);
    if (value.length > 10) {
      var len = value.length;
      value = value.substr(len - 10, len);
    }
    return value.padStart(10, '0');
  }

  static removeZeros(str) {
    var value = typeof str === 'string' ? str : String(str);
    return value.replace(/^0+/, '');
  }

  /**
   * Create new budget in database.
   * @param {Array} budget
   */
  static async create(budget) {
    try {
      var tvp = Budget.createTable(budget);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('BudgetTable', sql.TVP('BudgetTableType'), tvp);

      await request.execute('insertOrUpdateBudget');

      return budget;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Match HKONT in database.
   * @param {Object} hkont
   */
  static async matchHKONT(hkont) {
    try {
      var tvp = new sql.Table();
      tvp.columns.add('HKONT', sql.NChar(10), {
        nullable: false,
      });

      if (hkont instanceof Object)
        Object.keys(hkont).forEach((key) => tvp.rows.add(Budget.padZeros(key)));

      var pool = await getPool();
      var request = await pool
        .request()
        .input('HKONTTable', sql.TVP('HKONTTableType'), tvp);

      var res = await request.execute('matchHKONT');

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Match KOSTL in database.
   * @param {Object} kostl
   */
  static async matchKOSTL(kostl) {
    try {
      var tvp = new sql.Table();
      tvp.columns.add('KOSTL', sql.NChar(10), {
        nullable: false,
      });

      if (kostl instanceof Object)
        Object.keys(kostl).forEach((key) => tvp.rows.add(Budget.padZeros(key)));

      var pool = await getPool();
      var request = await pool
        .request()
        .input('KOSTLTable', sql.TVP('KOSTLTableType'), tvp);

      var res = await request.execute('matchKOSTL');

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }
}
