sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
) {
  'use strict';

  var BudgetService = APIService.extend('com.piasa.Costos.BudgetService', {
    constructor: function () {
      this.setBaseUrl('api/v1/budget');
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
    upload: async function (ignoreWarnings = false) {
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

        if (!ignoreWarnings) {
          try {
            await this.api('/match/kostl').post(kostl);
          } catch (error) {
            if (!error.details) throw error;
            details = details.concat(error.details);
          }

          try {
            await this.api('/match/hkont').post(hkont);
          } catch (error) {
            if (!error.details) throw error;
            details = details.concat(error.details);
          }

          if (details.length !== 0)
            throw {
              type: 'warning',
              message: 'Algunos centros de costos o cuentas no existen.',
              details: details,
            };
        }

        var file = this.getProperty('/budgetFile');

        // TODO: Add file support to APIService
        /*
        var uploadFile = () => {
          const fd = new FormData();
          console.log(file);
          fd.append('budget', file);

          return fetch('/api/v1/budget', {
            method: 'POST',
            body: fd,
          })
            .then((res) => res.json())
            .then((json) => {
              if (json.error) throw json.error;
            })
            .catch((error) => {
              if (error.name === 'SyntaxError')
                error = new Error(
                  'Problema con el servidor, contacta a un Administrador'
                );
              console.log(error);
              throw error;
            });
        };
        */

        /*
        var offset = 500;
        var size = budget.length;
        var i = 0, j = 0;
        while(j < size) {
          i = j;
          j += offset;
          if(j >= size)
            j = size;

          var a = budget.slice(i, j);
          await this.api().post(a);
        }
        */

        //await uploadFile();
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
