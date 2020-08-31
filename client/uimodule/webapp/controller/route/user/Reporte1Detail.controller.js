sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/format/NumberFormat',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    ToolHeader,
    MessageBox,
    MessageToast,
    NumberFormat,
    ReporteService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte1Detail.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.getRouter()
            .getRoute('reporte_1_detail')
            .attachMatched(function () {
              if (ReporteService.isReporte1Empty()) this.navTo('reporte_1');
            }, this);
        },
        format: {
          percentage: function (value) {
            if (!value) value = 0;

            var oPercentageFormat = NumberFormat.getPercentInstance({
              decimals: 2,
              groupingSeparator: ',',
              decimalSeparator: '.',
            });
            var result = oPercentageFormat.format(value);
            return result;
          },
          money: function (value) {
            if (!value) value = 0;

            var oCurrencyFormat = NumberFormat.getCurrencyInstance({
              groupingSeparator: ',',
              decimalSeparator: '.',
            });
            var result = oCurrencyFormat.format(value);
            return result;
          },
        },
      }
    );
  }
);
