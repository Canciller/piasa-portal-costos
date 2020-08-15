sap.ui.define(
  [
    'sap/ui/core/UIComponent',
    'sap/ui/Device',
    'com/piasa/Costos/model/models',
    'sap/ui/model/json/JSONModel',
  ],
  function (UIComponent, Device, models, JSONModel) {
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
        // Call the base component's init function
        UIComponent.prototype.init.apply(this, arguments);

        // Enable routing
        this.getRouter().initialize();

        // Set the device model
        this.setModel(models.createDeviceModel(), 'device');

        this.setModel(
          new JSONModel({
            username: null,
            email: null,
            role: null,
          }),
          'user'
        );

        // TODO: Show busy indicator
        //sap.ui.core.BusyIndicator.show();
      },
    });
  }
);
