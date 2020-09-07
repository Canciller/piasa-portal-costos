import sql, { Table } from 'mssql';
import hasAffectedRows from '../util/dbHasAffectedRows';
import getPool from '../util/dbGetPool';
import createHKONTTable from '../util/createHKONTTable';
import createABTEITable from '../util/createABTEITable';
import createVERAKTable from '../util/createVERAKTable';
import log from '../util/log/error';

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

  static async getReporte1(year, month, kostl, username) {
    try {
      var KOSTLTable = Reportes.createTable(kostl);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('YEAR', sql.NChar(4), String(year).substr(0, 4))
        .input(
          'MONTH',
          sql.NChar(2),
          String(month).substr(0, 2).padStart(2, '0')
        )
        .input('KOSTLTable', sql.TVP('KOSTLTableType'), KOSTLTable)
        .input('username', sql.VarChar(30), username);

      var res = await request.execute('getReporte1');

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  static async getReporte1Detail(
    year,
    month,
    desc1,
    kostl,
    isBudget = false,
    username
  ) {
    try {
      var KOSTLTable = Reportes.createTable(kostl);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('YEAR', sql.NChar(4), String(year).substr(0, 4))
        .input(
          'MONTH',
          sql.NChar(2),
          String(month).substr(0, 2).padStart(2, '0')
        )
        .input('DESC1', sql.VarChar(50), desc1)
        .input('KOSTLTable', sql.TVP('KOSTLTableType'), KOSTLTable)
        .input('username', sql.VarChar(30), username);

      var sp = isBudget ? 'Budget' : 'Real';
      var res = await request.execute('getReporte1Detail' + sp);

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  static async getReporte2(year, kostl, username) {
    try {
      var tvp = Reportes.createTable(kostl);
      var pool = await getPool();
      var request = await pool
        .request()
        .input('YEAR', sql.NChar(4), String(year).substr(0, 4))
        .input('KOSTLTable', sql.TVP('KOSTLTableType'), tvp)
        .input('username', sql.VarChar(30), username);

      var res = await request.execute('getReporte2');

      if (res.recordset && res.recordset.length !== 0) return res.recordset;

      return [];
    } catch (error) {
      throw error;
    }
  }

  static async getParams(username) {
    try {
      var pool = await getPool();
      var request = await pool
        .request()
        .input('username', sql.VarChar(30), username);
      var res = await request.execute('getReporteParams');

      if (res.recordsets && res.recordsets.length === 3) {
        return {
          abtei: res.recordsets[0],
          verak: res.recordsets[1],
          kostl: res.recordsets[2],
        };
      }

      return {
        abtei: [],
        verak: [],
        kostl: [],
      };
    } catch (error) {
      throw error;
    }
  }

  static async getParamsFiltered(username, abtei, verak) {
    try {
      var ABTEITable = createABTEITable(abtei),
        VERAKTable = createVERAKTable(verak);

      var pool = await getPool();
      var request = await pool
        .request()
        .input('username', sql.VarChar(30), username)
        .input('ABTEITable', sql.TVP(), ABTEITable)
        .input('VERAKTable', sql.TVP(), VERAKTable);

      var res = await request.execute('getReporteParamsFiltered');

      if (res.recordsets && res.recordsets.length === 3) {
        return {
          abtei: res.recordsets[0],
          verak: res.recordsets[1],
          kostl: res.recordsets[2],
        };
      }

      return {
        abtei: [],
        verak: [],
        kostl: [],
      };
    } catch (error) {
      throw error;
    }
  }
}
