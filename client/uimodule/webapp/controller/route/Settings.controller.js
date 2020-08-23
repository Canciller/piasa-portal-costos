sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
  ],
  function (BaseController, ToolHeader) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.Settings.controller', {
      Header: new ToolHeader(this),
      onInit: function () {
        this.getRouter()
          .getRoute('settings')
          .attachMatched(function () {}, this);
      },
    });
  }
);
