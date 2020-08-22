sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/m/MessageBox',
    '../../../service/BudgetService',
  ],
  function (BaseController, ToolHeader, MessageBox, BudgetService) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.ManageAssignments.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.getRouter()
            .getRoute('presupuesto')
            .attachMatched(function () {
              this.byId('uploadButton').clear();
              BudgetService.setProperty('/budget', []);
            }, this);
        },
        onNavBack: function () {
          this.byId('uploadButton').clear();
          BudgetService.setProperty('/budget', []);
          BaseController.prototype.onNavBack.call(this);
        },
        onUpload: function (oEvent) {
          const oFile = oEvent.getParameter('files')[0];
          var oReader = new FileReader();

          oReader.onload = function (e) {
            try {
              var data = e.target.result;
              var workbook = XLSX.read(data, {
                type: 'binary',
              });

              if (workbook.SheetNames[0].length > 0) {
                var firstSheetName = workbook.SheetNames[0];
                var worksheet = workbook.Sheets[firstSheetName];
                BudgetService.setProperty(
                  '/budget',
                  XLSX.utils.sheet_to_json(worksheet)
                );
              }
            } catch (error) {
              MessageBox.error(error.message);
              console.error(error);
            } finally {
              BudgetService.setProperty('/loading', false);
            }
          };

          BudgetService.setProperty('/loading', true);
          oReader.readAsBinaryString(oFile);
        },
      }
    );
  }
);
