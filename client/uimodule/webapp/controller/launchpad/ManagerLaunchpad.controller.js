sap.ui.define(
  ['com/piasa/Costos/controller/BaseController'],
  function (BaseController) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.ManagerLaunchpad.controller', {
      onPressAssignments: function () {
        this.navTo('assignments');
      },
    });
  }
);
