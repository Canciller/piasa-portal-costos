sap.ui.define(['com/piasa/Costos/controller/BaseController'], function (
  BaseController
) {
  'use strict';

  return BaseController.extend('com.piasa.Costos.ManagerLaunchpad.controller', {
    onPressManageAssignments: function () {
      this.navTo('assignments');
    },
    onPressLoadBudget: function () {
      this.navTo('presupuesto');
    },
    onPressReporte1: function () {
      this.navTo('reporte_1');
    },
    onPressReporte2: function () {
      this.navTo('reporte_2');
    },
  });
});
