sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'sap/ui/core/Fragment',
    '../../service/AuthService',
  ],
  function (BaseController, Fragment, AuthService) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.ToolHeader.controller', {
      onHomePress: function () {
        this.navTo('launchpad');
      },
      onUsernamePress: function (oEvent) {
        var oUsername = oEvent.getSource();

        if (!this._popover) {
          Fragment.load({
            id: 'userPopover',
            name: 'com.piasa.Costos.view.layout.UserPopover',
            controller: this,
          }).then(
            function (oPopover) {
              this._popover = oPopover;
              this.getView().addDependent(this._oPopover);
              this._popover.openBy(oUsername);
              this._popover.setModel(this.getModel('user'), 'user');
              this._popover.setModel(this.getModel('i18n'), 'i18n');
            }.bind(this)
          );
        } else {
          this._popover.openBy(oUsername);
        }
      },
      onLogoutPress: function () {
        AuthService.logout()
          .catch()
          .then(
            function () {
              this.navTo('login', {}, true);
            }.bind(this)
          );
      },
      onSettingsPress: function () {
        this.navTo('settings');
      },
    });
  }
);
