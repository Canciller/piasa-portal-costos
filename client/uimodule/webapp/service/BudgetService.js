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
    setBudget: function (budget) {
      this.setProperty('/budget', budget);
      this.createHKONTFromBudget();
      this.createKOSTLFromBudget();
    },
    createHKONTFromBudget: function () {
      var hkont = {};
      var budget = this.getBudget();

      for (var i = budget.length; i--; ) {
        var row = budget[i];
        if (!row.HKONT) continue;
        hkont[row.HKONT] = true;
      }

      this.setProperty('/hkont', hkont);
    },
    getHKONT: function () {
      return this.getProperty('/hkont');
    },
    createKOSTLFromBudget: function () {
      var kostl = {};
      var budget = this.getBudget();

      for (var i = budget.length; i--; ) {
        var row = budget[i];
        if (!row.KOSTL) continue;
        kostl[row.KOSTL] = true;
      }

      this.setProperty('/kostl', kostl);
    },
    getKOSTL: function () {
      return this.getProperty('/kostl');
    },
    upload: async function () {
      try {
        this.setProperty('/loading', true);

        var details = [];

        var budget = this.getBudget(),
          hkont = this.getHKONT(),
          kostl = this.getKOSTL();

        if (!(budget instanceof Array))
          throw new Error('El presupuesto no esta en un formato valido.');

        if (budget.length === 0)
          throw new Error(
            'Antes de subir el presupuesto se debe de cargar un archivo.'
          );

        try {
          await this.api('/match/kostl').post(kostl);
        } catch (error) {
          details = details.concat(error.details);
        }

        try {
          await this.api('/match/hkont').post(hkont);
        } catch (error) {
          details = details.concat(error.details);
        }

        if (details.length !== 0)
          throw {
            message: 'Algunos centros de costos o cuentas no existen.',
            details: details,
          };

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
