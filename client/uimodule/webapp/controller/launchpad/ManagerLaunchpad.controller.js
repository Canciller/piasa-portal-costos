sap.ui.define(
  ['com/piasa/Costos/controller/BaseController'],
  function (BaseController) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.ManagerLaunchpad.controller', {
      onPressManageUsers: function () {
        this.navTo('assignments');
      },
    });
  }
);
