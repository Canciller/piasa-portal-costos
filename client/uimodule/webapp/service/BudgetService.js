sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
) {
  'use strict';

  var BudgetService = APIService.extend('com.piasa.Costos.BudgetService', {
    constructor: function () {
      this.setBaseUrl('/api/v1/budger');
      this.setModel(
        new JSONModel({
          budget: [],
        })
      );
    },
  });

  return new BudgetService();
});
