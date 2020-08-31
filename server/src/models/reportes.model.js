import sql, { Table } from 'mssql';
import hasAffectedRows from '../util/dbHasAffectedRows';
import getPool from '../util/dbGetPool';
import log from '../util/log/error';
import { compareSync } from 'bcrypt';

/**
 * Class representing Reportes.
 */
export default class Reportes {
  /**
   * Create tvp from kostl.
   * @param {Array} kostl
   */
  static createTable(kostl) {
    var tvp = new sql.Table();
    tvp.columns.add('KOSTL', sql.NChar(10), {
      nullable: false,
    });

    if (kostl instanceof Array)
      kostl.forEach((value) =>
        tvp.rows.add(String(value).substr(0, 10).padStart(10, '0'))
      );

    return tvp;
  }

  static async getReporte1(year, month, kostl) {
    try {
      var tvp = Reportes.createTable(kostl);
      var pool = await getPool();
      var request = await pool
        .request()
        .input('YEAR', sql.NChar(4), String(year).substr(0, 4))
        .input(
          'MONTH',
          sql.NChar(2),
          String(month).substr(0, 2).padStart(2, '0')
        )
        .input('KOSTLTable', sql.TVP('KOSTLTableType'), tvp);

      var res = await request.execute('getReporte1');

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  static async getReporte1Detail(year, month, hkont, kostl) {
    try {
      var tvp = Reportes.createTable(kostl);
      var pool = await getPool();
      var request = await pool
        .request()
        .input('YEAR', sql.NChar(4), String(year).substr(0, 4))
        .input(
          'MONTH',
          sql.NChar(2),
          String(month).substr(0, 2).padStart(2, '0')
        )
        .input('HKONT', sql.NChar(10), String(hkont).substr(0, 10).padStart(10, '0'))
        .input('KOSTLTable', sql.TVP('KOSTLTableType'), tvp);

      var res = await request.execute('getReporte1Detail');

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }
}
