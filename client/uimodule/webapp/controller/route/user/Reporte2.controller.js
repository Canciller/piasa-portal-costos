sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/format/NumberFormat',
  ],
  function (
    BaseController,
    ToolHeader,
    MessageBox,
    MessageToast,
    NumberFormat
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte2.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.getRouter()
            .getRoute('reporte_2')
            .attachMatched(function () {}, this);
        },
      }
    );
  }
);
