sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'com/piasa/Costos/controller/launchpad/AdministradorLaunchpad.controller',
    'sap/ui/core/Fragment',
    '../../service/RoleService',
  ],
  function (
    BaseController,
    ToolHeader,
    AdministradorLaunchpad,
    Fragment,
    RoleService
  ) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.Launchpad.controller', {
      Header: new ToolHeader(this),
      Admin: new AdministradorLaunchpad(this),
      onInit: function () {
        this.getRouter()
          .getRoute('launchpad')
          .attachMatched(function () {
            var oUserModel = this.getModel('user');
            oUserModel.bindProperty('/role').attachChange(
              function (oEvent) {
                var role = oEvent.getSource().getValue();
                if (this._lastRole && this._lastRole === role) return;
                this._lastRole = role;
                if (role) this._loadLaunchpad(role);
              }.bind(this)
            );
          }, this);
      },
      _loadLaunchpad: function (role) {
        try {
          var basePath = 'com.piasa.Costos.view.launchpad.';
          var oMain = this.byId('main');
          var oController = this;

          RoleService.getRoleName(role)
            .then((name) =>
              Fragment.load({
                id: 'launchpad' + name,
                name: basePath + name + 'Launchpad',
                controller: oController,
              })
            )
            .then(
              function (oLaunchpad) {
                this.getView().addDependent(oLaunchpad);
                oLaunchpad.setModel(this.getModel('i18n', 'i18n'));
                oMain.destroyContent();
                oMain.addContent(oLaunchpad);
              }.bind(oController)
            )
            .catch((err) => {
              // TODO: Handle error
              console.log(err);
            });
        } catch (err) {
          // TODO: Handle error
          console.error(err);
        }
      },
    });
  }
);
