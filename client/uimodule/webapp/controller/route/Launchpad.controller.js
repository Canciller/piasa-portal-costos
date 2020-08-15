sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'com/piasa/Costos/controller/launchpad/AdminLaunchpad.controller',
    'sap/ui/core/Fragment',
  ],
  function (BaseController, ToolHeader, AdminLaunchpad, Fragment) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.Launchpad.controller', {
      Header: new ToolHeader(this),
      Admin: new AdminLaunchpad(this),
      _getLaunchpadName: function (role) {
        var name = 'User';
        switch (role) {
          case 'A':
            name = 'Admin';
            break;
          case 'M':
            name = 'Manager';
            break;
          default:
            break;
        }

        return name;
      },
      _loadLaunchpad: function (role) {
        try {
          var oMain = this.byId('main');
          var base = 'com.piasa.Costos.view.launchpad.',
            name = this._getLaunchpadName(role);

          Fragment.load({
            id: 'launchpad' + name,
            name: base + name,
            controller: this,
          }).then(
            function (oLaunchpad) {
              this.getView().addDependent(oLaunchpad);
              oLaunchpad.setModel(this.getModel('i18n', 'i18n'));
              oMain.destroyContent();
              oMain.addContent(oLaunchpad);
            }.bind(this)
          );
        } catch (err) {
          // TODO: Handle error.
          console.error(err);
        }
      },
      _checkUser: function () {
        fetch('/api/v1/auth/me')
          .then((res) => res.json())
          .then((data) => {
            if (data.error) throw data.error;
            this.setUser(data);
            this._loadLaunchpad(data.role);
          })
          .catch(() => {
            this.setUser({ username: null, role: null });
            this.navTo('login');
          })
          .then(() => {
            // Hide busy indicator
            sap.ui.core.BusyIndicator.hide();
          });
      },
      onAfterRendering: function () {
        var oRouter = this.getRouter();
        oRouter.getRoute('launchpad').attachMatched(this._checkUser, this);
      },
    });
  }
);
