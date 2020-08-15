sap.ui.define(
  ['com/piasa/Costos/controller/BaseController', 'sap/ui/core/Fragment'],
  function (BaseController, Fragment) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.ToolHeader.controller', {
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
        fetch('/api/v1/auth/logout')
          .catch()
          .then(() => {
            this.navTo('login', {}, true);
          });
      },
    });
  }
);
