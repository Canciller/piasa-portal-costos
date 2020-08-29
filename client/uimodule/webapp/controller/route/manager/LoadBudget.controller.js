sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/format/NumberFormat',
    '../../../service/BudgetService',
  ],
  function (
    BaseController,
    ToolHeader,
    MessageBox,
    MessageToast,
    NumberFormat,
    BudgetService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.ManageAssignments.controller',
      {
        Header: new ToolHeader(this),
        formatCurrency: function (value) {
          var oCurrencyFormat = NumberFormat.getCurrencyInstance();
          var result = oCurrencyFormat.format(value);
          if (result.length === 0) return `'${value}'!`;
          return result;
        },
        onInit: function () {
          this.template = [
            'KOSTL',
            'HKONT',
            'GJAHR',
            'P1',
            'P2',
            'P3',
            'P4',
            'P5',
            'P6',
            'P7',
            'P8',
            'P9',
            'P10',
            'P11',
            'P12',
          ];

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
        onUploadToServer: async function () {
          try {
            await BudgetService.upload();
            MessageToast.show('Presupuesto actualizado exitosamente.');
          } catch (error) {
            var msg = error.message;
            if (error.details && error.details instanceof Array)
              error.details.forEach((detail) => {
                if (detail && detail.msg) msg += '\n* ' + detail.msg;
              });
            MessageBox.error(msg);
          }
        },
        onUpload: function (oEvent) {
          const oFile = oEvent.getParameter('files')[0];
          if (!oFile) return;

          BudgetService.setProperty('/loading', true);
          var oReader = new FileReader();

          oReader.onload = function (e) {
            try {
              var budget = e.target.result;
              var workbook = XLSX.read(budget, {
                type: 'binary',
              });

              if (workbook.SheetNames[0].length > 0) {
                var firstSheetName = workbook.SheetNames[0];
                var ws = workbook.Sheets[firstSheetName];

                var range = XLSX.utils.decode_range(ws['!ref']);
                for (
                  var c = range.s.c, i = 0;
                  c <= range.e.c && i < this.template.length;
                  ++c, ++i
                ) {
                  var header = XLSX.utils.encode_col(c) + '1';
                  if (!ws[header])
                    throw new Error('El archivo no esta en un formato valido.');
                  ws[header].v = this.template[i];
                  ws[header].w = this.template[i];
                }
                var budget = XLSX.utils.sheet_to_json(ws, { raw: true });

                BudgetService.setBudget(budget);
              }
            } catch (error) {
              MessageBox.error(error.message);
              console.error(error);
            } finally {
              BudgetService.setProperty('/loading', false);
            }
          }.bind(this);

          oReader.readAsBinaryString(oFile);
        },
      }
    );
  }
);
