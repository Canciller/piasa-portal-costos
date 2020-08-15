sap.ui.define(
  ['com/piasa/Costos/controller/BaseController', 'sap/ui/core/Fragment'],
  function (BaseController) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.AdminLaunchpad.controller', {
      onPressManageUsers: function () {
        this.navTo('users');
      },
    });
  }
);
