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
      budget = await Budget.create(budget);

      return res.json(budget);
    } catch (error) {
      next(error);
    }
  },
};
