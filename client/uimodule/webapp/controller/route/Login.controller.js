sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'sap/ui/model/json/JSONModel',
    'sap/ui/core/Core',
    'sap/ui/core/theming/Parameters',
    'sap/ui/core/IconPool',
    '../../service/AuthService',
  ],
  function (
    BaseController,
    JSONModel,
    Core,
    Parameters,
    IconPool,
    AuthService
  ) {
    'use strict';
    return BaseController.extend('com.piasa.Costos.Login.controller', {
      onInit: function () {
        let oView = this.getView(),
          oMM = Core.getMessageManager();

        this._oLoginModel = new JSONModel({
          username: '',
          password: '',
        });

        oView.setModel(this._oLoginModel, 'login');
        oMM.registerObject(this.byId('username'), true);
        oMM.registerObject(this.byId('password'), true);

        // Hide error message.
        var oErrorMessage = this.byId('errorMessage');
        oErrorMessage.setVisible(false);
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

        if (!bValidationError) {
          // No validation error.
          let username = this._oLoginModel.oData.username,
            password = this._oLoginModel.oData.password;

          // Call login service.
          AuthService.login(username, password)
            .then(() => {
              oErrorMessage.setVisible(false);

              // Go to launchpad.
              this.navTo('launchpad', {}, true);
            })
            .catch((error) => {
              oErrorMessage.setVisible(true);
              if (error.status === 401) {
                // Bad Credentials
                oErrorMessage.setText(
                  this.getModel('i18n')
                    .getResourceBundle()
                    .getText('loginFormBadCredentials')
                );
              } else if (error.status === 403) {
                // Not Active
                oErrorMessage.setText(
                  this.getModel('i18n')
                    .getResourceBundle()
                    .getText('loginFormUnactive')
                );
              } else {
                // Server Error
                oErrorMessage.setText(
                  this.getModel('i18n')
                    .getResourceBundle()
                    .getText('loginFormServerError')
                );
              }
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

        if(!this._loaded) {
          let oUserInput = this.byId('username'),
            oPasswordInput = this.byId('password');

          if (oUserInput && oPasswordInput) {
            oUserInput.addBeginIcon(IconPool.getIconURI('person-placeholder'));
            oPasswordInput.addBeginIcon(IconPool.getIconURI('key'));
          }

          this._loaded = true;
        }

        // Hide busy indicator
        sap.ui.core.BusyIndicator.hide();
      },
    });
  }
);
