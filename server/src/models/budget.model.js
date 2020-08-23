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
}
