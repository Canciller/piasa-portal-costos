sap.ui.define(['com/piasa/Costos/controller/BaseController'], function (
  BaseController
) {
  'use strict';

  return BaseController.extend('com.piasa.Costos.ManagerLaunchpad.controller', {
    onPressReporte1: function () {
      this.navTo('reporte_1');
    },
    onPressReporte2: function () {
      this.navTo('reporte_2');
    },
  });
});
