import ValidationError from '../util/error/ValidationError';
import UnauthorizedError from '../util/error/UnauthorizedError';
import Assignment from '../models/assignment.model';
import Reportes from '../models/reportes.model';

export default {
  getKOSTL: async function (req, res, next) {
    try {
      var assignments = await Assignment.getLinked(req.user.username);
      return res.json(assignments);
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

      var reporte1 = await Reportes.getReporte1(year, month, kostl);

      for (var i = reporte1.length; i--; ) {
        var row = reporte1[i],
          actual = row['Actual'],
          budget = row['Budget'],
          actualAccum = row['Actual_Accum'],
          budgetAccum = row['Budget_Accum'];
        row['Var_vs_AA'] = actualAccum - budgetAccum;
        row['Var_vs_Budget'] = actual - budget;

        row['Percentage_1'] = 0;
        if (budget !== 0) {
          row['Percentage_1'] = actual / budget;
        }

        row['Percentage_2'] = 0;
        if (budgetAccum !== 0) {
          row['Percentage_2'] = actualAccum / budgetAccum;
        }
      }

      return res.json(reporte1);
    } catch (error) {
      next(error);
    }
  },
  getReporte1Detail: async function (req, res, next) {
    try {
      var year = req.body.year,
        month = req.body.month,
        hkont = req.body.hkont,
        kostl = req.body.kostl;

      var match = await Assignment.matchKOSTL(req.user.username, kostl);
      if (!match)
        throw new UnauthorizedError(
          'Los centros de costos no se le fueron asignados.'
        );

      var reporte1Detail = await Reportes.getReporte1Detail(year, month, hkont, kostl);

      return res.json(reporte1Detail);
    } catch (error) {
      next(error);
    }
  },
};
