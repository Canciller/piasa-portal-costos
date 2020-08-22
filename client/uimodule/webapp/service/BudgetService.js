sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
) {
  'use strict';

  var BudgetService = APIService.extend('com.piasa.Costos.BudgetService', {
    constructor: function () {
      this.setBaseUrl('/api/v1/budget');
      this.setModel(
        new JSONModel({
          budget: [],
        })
      );
    },
    getBudget: function () {
      return this.getProperty('/budget');
    },
    upload: async function () {
      try {
        this.setProperty('/loading', true);

        var budget = this.getBudget();

        if (!(budget instanceof Array))
          throw new Error('El presupuesto no esta en un formato valido.');

        if (budget.length === 0)
          throw new Error(
            'Antes de subir el presupuesto se debe de cargar un archivo.'
          );

        await this.api().post(budget);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/loading', false);
      }
    },
  });

  return new BudgetService();
});
