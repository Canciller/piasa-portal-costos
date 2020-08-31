import Budget from '../models/budget.model';
import formatBudget from '../util/formatBudget';
import ValidationError from '../util/error/ValidationError';

export default {
  create: async (req, res, next) => {
    try {
      var budget = req.body;

      if (!(budget instanceof Array))
        throw new ValidationError('Formato de presupuesto invalido.');
      if (budget.length === 0)
        throw new ValidationError('El presupuesto esta vacio.');

      budget = await formatBudget(budget);
      await Budget.create(budget);

      //return res.json(budget);
      return res.json({
        success: true
      });
    } catch (error) {
      next(error);
    }
  },
  matchHKONT: async (req, res, next) => {
    try {
      var hkont = req.body;
      if (!(hkont instanceof Object))
        throw new ValidationError('El formato de cuentas no es valido.');

      var details = [];

      var matched = await Budget.matchHKONT(hkont);
      for (var i = matched.length; i--; ) {
        var el = matched[i];
        var key = Budget.removeZeros(el.HKONT);
        if (hkont[key]) delete hkont[key];
      }

      Object.keys(hkont).forEach((key) =>
        details.push({
          value: key,
          msg: `La cuenta '${key}' no existe.`,
        })
      );

      if (details.length !== 0)
        throw new ValidationError('Algunas cuentas no existen.', details);

      return res.json({});
    } catch (error) {
      next(error);
    }
  },
  matchKOSTL: async (req, res, next) => {
    try {
      var kostl = req.body;
      if (!(kostl instanceof Object))
        throw new ValidationError(
          'El formato de centros de costos no es valido.'
        );

      var details = [];

      var matched = await Budget.matchKOSTL(kostl);
      for (var i = matched.length; i--; ) {
        var el = matched[i];
        var key = Budget.removeZeros(el.KOSTL);
        if (kostl[key]) delete kostl[key];
      }

      Object.keys(kostl).forEach((key) =>
        details.push({
          value: key,
          msg: `El centro de costo '${key}' no existe.`,
        })
      );

      if (details.length !== 0)
        throw new ValidationError(
          'Algunos centros de costos no existen.',
          details
        );

      return res.json({});
    } catch (error) {
      next(error);
    }
  },
};
