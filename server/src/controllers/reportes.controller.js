import ValidationError from '../util/error/ValidationError';
import UnauthorizedError from '../util/error/UnauthorizedError';
import Assignment from '../models/assignment.model';
import Reportes from '../models/reportes.model';

var monthLabel = [
  'P01',
  'P02',
  'P03',
  'P04',
  'P05',
  'P06',
  'P07',
  'P08',
  'P09',
  'P10',
  'P11',
  'P12',
];

export default {
  getKOSTL: async function (req, res, next) {
    try {
      var assignments = await Assignment.getLinked(req.user.username);
      return res.json(assignments);
    } catch (error) {
      next(error);
    }
  },
  getParams: async function (req, res, next) {
    try {
      var params = await Reportes.getParams(req.user.username);
      return res.json(params);
    } catch (error) {
      next(error);
    }
  },
  getParamsFiltered: async function (req, res, next) {
    try {
      var params = await Reportes.getParamsFiltered(
        req.user.username,
        req.body.abtei,
        req.body.verak
      );
      return res.json(params);
    } catch (error) {
      next(error);
    }
  },
  getReporte1: async function (req, res, next) {
    try {
      var year = req.body.year,
        month = req.body.month,
        kostl = req.body.kostl;

      var match = await Assignment.matchKOSTL(req.user.username, kostl);
      if (!match)
        throw new UnauthorizedError(
          'Los centros de costos ingresados no se le fueron asignados.'
        );

      // TODO matchHKONT

      var reporte1 = await Reportes.getReporte1(
        year,
        month,
        kostl,
        req.user.username
      );

      /*
      for (var i = reporte1.length; i--; ) {
        var row = reporte1[i],
          actual = row['Actual'],
          budget = row['Budget'],
          actualAccum = row['Actual_Accum'],
          budgetAccum = row['Budget_Accum'];
        row['Var_vs_AA'] = (actualAccum - budgetAccum).toFixed(2);
        row['Var_vs_Budget'] = (actual - budget).toFixed(2);

        row['Percentage_1'] = 0;
        if (budget !== 0) {
          row['Percentage_1'] = (actual / budget).toFixed(2);
        }

        row['Percentage_2'] = 0;
        if (budgetAccum !== 0) {
          row['Percentage_2'] = (actualAccum / budgetAccum).toFixed(2);
        }
      }
      */

      return res.json(reporte1);
    } catch (error) {
      next(error);
    }
  },
  getReporte1Detail: async function (req, res, next) {
    try {
      var year = req.body.year,
        month = req.body.month,
        kostl = req.body.kostl,
        desc1 = req.body.desc1,
        isBudget = req.isBudget;

      var match = await Assignment.matchKOSTL(req.user.username, kostl);
      if (!match)
        throw new UnauthorizedError(
          'Los centros de costos no se le fueron asignados.'
        );

      var reporte1Detail = await Reportes.getReporte1Detail(
        year,
        month,
        desc1,
        kostl,
        isBudget,
        req.user.username
      );

      return res.json(reporte1Detail);
    } catch (error) {
      next(error);
    }
  },
  getReporte2: async function (req, res, next) {
    try {
      var year = req.body.year,
        kostl = req.body.kostl;

      var match = await Assignment.matchKOSTL(req.user.username, kostl);
      if (!match)
        throw new UnauthorizedError(
          'Los centros de costo ingresados no se le fueron asignados.'
        );

      var output = [];
      var reporte = await Reportes.getReporte2(year, kostl, req.user.username);

      var data = {};

      var addValue = function (desc1, month, year, value) {
        if (!data[desc1]) data[desc1] = {};
        if (!data[desc1][year]) data[desc1][year] = {};
        data[desc1][year];
        data[desc1][year][month] = value;
      };

      for (var i = reporte.length; i--; ) {
        var row = reporte[i];
        var y = Number(row.GJAHR),
          month = row.MONAT,
          actual = row.ACTUAL,
          budget = row.BUDGET,
          desc1 = row.DESC1;

        var m = Number(month) - 1;
        month = monthLabel[m];

        if (y === Number(year) - 1) {
          if (actual) addValue(desc1, month, 'aly', actual);
        } else {
          if (actual) addValue(desc1, month, 'a', actual);
          if (budget) addValue(desc1, month, 'b', budget);
        }
      }

      var addRow = function (desc1, data) {
        var lines = [
          {
            TXT50: 'Real',
            DESC1: desc1,
            YEAR: year,
          },
          {
            TXT50: 'Presupuesto',
            DESC1: desc1,
            YEAR: year,
          },
          {
            TXT50: 'Real (Año Anterior)',
            DESC1: desc1,
            YEAR: Number(year) - 1,
          },
        ];

        lines[0] = Object.assign(lines[0], data.a);
        lines[1] = Object.assign(lines[1], data.b);
        lines[2] = Object.assign(lines[2], data.aly);

        for(var i = monthLabel.length; i--;) {
          var month = monthLabel[i];
          if(!lines[0][month]) lines[0][month] = 0;
          if(!lines[1][month]) lines[1][month] = 0;
          if(!lines[2][month]) lines[2][month] = 0;
        }

        output = output.concat(lines);
      };

      var keys = Object.keys(data);
      for(var i = keys.length; i--;) {
        var desc1 = keys[i];
        addRow(desc1, data[desc1]);
      }

      /*
      var output = [
        {
          TXT50: 'Real',
          YEAR: year,
        },
        {
          TXT50: 'Presupuesto',
          YEAR: year,
        },
        {
          TXT50: 'Real (Año Anterior)',
          YEAR: Number(year) - 1,
        },
      ];

      var setValue = function (i, month, value) {
        output[i]['P' + month] = value;
      };

      for (var i = reporte.length; i--; ) {
        var row = reporte[i];
        var y = Number(row.YEAR),
          m = row.MONTH,
          actual = row.ACTUAL,
          budget = row.BUDGET;

        if (y === Number(year) - 1) {
          if (actual !== 0) setValue(2, m, actual);
        } else {
          if (actual !== 0) setValue(0, m, actual);
          if (budget !== 0) setValue(1, m, budget);
        }
      }

      for (var i = output.length; i--; ) {
        for (var j = month.length; j--; ) {
          var key = month[j];
          if (!output[i][key]) output[i][key] = 0;
        }
      }
      */

      return res.json(output);
    } catch (error) {
      next(error);
    }
  },
};
