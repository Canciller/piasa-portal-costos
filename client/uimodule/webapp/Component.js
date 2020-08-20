sap.ui.define(
  [
    'sap/ui/core/UIComponent',
    'sap/ui/Device',
    'com/piasa/Costos/model/models',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/routing/History',
    './service/UserService',
    './service/AuthService',
    './service/RoleService',
    './service/AssignmentService',
  ],
  function (
    UIComponent,
    Device,
    models,
    JSONModel,
    History,
    UserService,
    AuthService,
    RoleService,
    AssignmentService
  ) {
    'use strict';

    return UIComponent.extend('com.piasa.Costos.Component', {
      metadata: {
        manifest: 'json',
      },

      /**
       * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
       * @public
       * @override
       */
      init: function () {
        // Call the base component's init function.
        UIComponent.prototype.init.apply(this, arguments);

        // Enable routing.
        var oRouter = this.getRouter();
        oRouter.initialize();

        // Set the device model.
        this.setModel(models.createDeviceModel(), 'device');

        // TODO: Move model creation to service class.
        // TODO: Define service base url inside service class, see assignments service.

        // Users model
        var oUserModel = new JSONModel({
          users: [],
          saved: {},
        });

        this.setModel(oUserModel, 'users');

        UserService.setModel(oUserModel);
        UserService.setBaseUrl('/api/v1/users');

        // Auth model
        var oAuthModel = new JSONModel({
          username: null,
          email: null,
          role: null,
          name: null,
        });

        this.setModel(oAuthModel, 'user');

        AuthService.setModel(oAuthModel);
        AuthService.setBaseUrl('/api/v1/auth');

        this.setModel(AssignmentService.getModel(), 'assignments');

        // TODO: Refactor this using a single promise.

        // Check if user is logged in.
        oRouter.attachRouteMatched(function (oEvent) {
          var name = oEvent.getParameter('name');
          switch (name) {
            case 'login':
              AuthService.me()
                .then(() => {
                  oRouter.navTo('launchpad', {}, true);
                })
                .catch((error) => {
                  // TODO: Handle server connection error here.
                  console.error(error);
                });
              break;
            default:
              AuthService.me()
                .then((user) => RoleService.getPermissions(user.role))
                .then((permissions) => {
                  var assignments = permissions.assignments,
                    users = permissions.users;
                  var allow = false;
                  switch (name) {
                    case 'users':
                      if (users.all) allow = true;
                      break;
                    case 'assignments':
                      if (assignments.all && users.read) allow = true;
                      break;
                    default:
                      allow = true;
                      break;
                  }
                  if (!allow) {
                    var sPreviousHash = History.getInstance().getPreviousHash();

                    if (sPreviousHash !== undefined) window.history.back();
                    else throw new Error('Unauthorized');
                  }
                })
                .catch((error) => {
                  // TODO: Handle server connection error here.
                  console.error(error);
                  oRouter.navTo('login', {}, true);
                });
              break;
          }
        }, this);
      },
    });
  }
);
