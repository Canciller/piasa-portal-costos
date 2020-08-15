sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Core',
    'sap/ui/core/theming/Parameters',
    'sap/ui/core/IconPool',
  ],
  function (BaseController, JSONModel, Core, Parameters, IconPool) {
    'use strict';
    return BaseController.extend('com.piasa.Costos.Login.controller', {
      onInit: function () {
        var oErrorMessage = this.byId('errorMessage');
        oErrorMessage.setVisible(false);

        let oView = this.getView(),
          oMM = Core.getMessageManager();

        this._oUserModel = this.getOwnerComponent().getModel('user');
        this._oLoginModel = new JSONModel({
          username: '',
          password: '',
        });

        oView.setModel(this._oLoginModel, 'login');
        oMM.registerObject(this.byId('username'), true);
        oMM.registerObject(this.byId('password'), true);

        fetch('/api/v1/auth/me')
          .then((res) => res.json())
          .then((data) => {
            if (data.error) throw data.error;
            this._setUserAndRedirect(data);
          })
          .catch(() => {});
      },
      _validateInput: function (oInput) {
        let sValueState = 'None',
          sValueStateText = undefined,
          bValidationError = false,
          oBinding = oInput.getBinding('value');

        try {
          oBinding.getType().validateValue(oInput.getValue());
        } catch (oException) {
          sValueState = 'Error';
          sValueStateText = this.getModel('i18n')
            .getResourceBundle()
            .getText('loginFormInvalid');
          bValidationError = true;
        }

        oInput.setValueState(sValueState);
        oInput.setValueStateText(sValueStateText);

        return bValidationError;
      },
      _setUserAndRedirect: function (data) {
        this.setUser(data);
        this.navTo('launchpad', null, true);
      },
      OnChange: function (oEvent) {
        let oInput = oEvent.getSource();
        this._validateInput(oInput);
      },
      OnSubmit: function () {
        var oErrorMessage = this.byId('errorMessage');
        var aInputs = [this.byId('username'), this.byId('password')],
          bValidationError = false;

        aInputs.forEach(function (oInput) {
          bValidationError = this._validateInput(oInput) || bValidationError;
        }, this);

        if (bValidationError) {
          // Handle validation error.
        } else {
          // No validation error.
          let username = this._oLoginModel.oData.username,
            password = this._oLoginModel.oData.password;

          fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              password: password,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) throw data.error;
              oErrorMessage.setVisible(false);
              this._setUserAndRedirect(data);
            })
            .catch(() => {
              oErrorMessage.setVisible(true);
              oErrorMessage.setText(
                this.getModel('i18n')
                  .getResourceBundle()
                  .getText('loginFormBadCredentials')
              );
            })
            .then(() => {
              this._oLoginModel.setProperty('/password', '');
            });
        }
      },
      onAfterRendering: function () {
        // Add border to login form.

        let oForm = this.byId('loginForm'),
          oFormStyle = {
            'border-width': 'sapUiFieldBorderWidth',
            'border-radius': 'sapUiFieldBorderCornerRadius',
            'border-color': 'sapUiFieldBorderColor',
            'border-style': 'solid',
          };

        Object.keys(oFormStyle).forEach((key) => {
          var value = Parameters.get(oFormStyle[key]);
          if (value) oFormStyle[key] = value;
        });

        if (oForm) oForm.$().css(oFormStyle);

        // Set begin icons of inputs.

        let oUserInput = this.byId('username'),
          oPasswordInput = this.byId('password');

        if (oUserInput && oPasswordInput) {
          oUserInput.addBeginIcon(IconPool.getIconURI('person-placeholder'));
          oPasswordInput.addBeginIcon(IconPool.getIconURI('key'));
        }

        // Hide busy indicator
        sap.ui.core.BusyIndicator.hide();
      },
    });
  }
);
