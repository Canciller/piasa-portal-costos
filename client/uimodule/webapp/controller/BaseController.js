sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/routing/History',
    'sap/ui/core/UIComponent',
    'com/piasa/Costos/model/formatter',
  ],
  function (Controller, History, UIComponent, formatter) {
    'use strict';

    return Controller.extend('com.piasa.Costos.controller.BaseController', {
      formatter: formatter,

      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @public
       * @param {string} sName the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      /**
       * Convenience method for setting the view model in every controller of the application.
       * @public
       * @param {sap.ui.model.Model} oModel the model instance
       * @param {string} sName the model name
       * @returns {sap.ui.mvc.View} the view instance
       */
      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },

      /**
       * Get user model.
       */
      getUser: function () {
        return this.getModel('user');
      },

      /**
       * Set user model.
       * @param {Object} data
       */
      setUser: function (data) {
        var oUserModel = this.getModel('user');
        if (!oUserModel) return;

        oUserModel.setProperty('/username', data.username);
        oUserModel.setProperty('/name', data.name);
        oUserModel.setProperty('/email', data.email);
        var role = 'User';
        switch (data.role) {
          case 'A':
            role = 'Administrator';
            break;
          case 'M':
            role = 'Manager';
            break;
          default:
            break;
        }
        oUserModel.setProperty('/role', role);
        oUserModel.setProperty('/actualRole', data.role);
      },

      /**
       * Load saved user if exists.
       * @param {Function} callback
       */
      loadUser: function (callback) {
        fetch('/api/v1/auth/me')
          .then((res) => res.json())
          .then((data) => {
            if (data.error) throw data.error;
            this.setUser(data);
            console.log(callback);
          })
          .catch((error) => {
            console.log(error);
            this.setUser({ username: null, role: null });
            this.navTo('login');
          });
      },

      /**
       * Convenience method for getting the resource bundle.
       * @public
       * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
       */
      getResourceBundle: function () {
        return this.getOwnerComponent().getModel('i18n').getResourceBundle();
      },

      /**
       * Method for navigation to specific view
       * @public
       * @param {string} psTarget Parameter containing the string for the target navigation
       * @param {mapping} pmParameters? Parameters for navigation
       * @param {boolean} pbReplace? Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
       */
      navTo: function (psTarget, pmParameters, pbReplace) {
        this.getRouter().navTo(psTarget, pmParameters, pbReplace);
      },

      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.back();
        } else {
          this.getRouter().navTo('launchpad', {}, true /*no history*/);
        }
      },
    });
  }
);
