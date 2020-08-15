sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
  ],
  function (BaseController, ToolHeader) {
    'use strict';
    return BaseController.extend('com.piasa.Costos.AdminLaunchpad.controller', {
      Header: new ToolHeader(this),
      onAfterRendering: function () {
        var oRouter = this.getRouter();
        oRouter.getRoute('users').attachMatched(this.loadUser, this);
        /*
        oRouter.attachRouteMatched(function() {
          console.log('all routes');
        }, this);
        */
      },
    });
  }
);
