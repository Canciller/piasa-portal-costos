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
        let oView = this.getView(),
          oMM = Core.getMessageManager();

        oView.setModel(
          new JSONModel({
            username: '',
            password: '',
            message: ''
          }),
          'login'
        );

        oMM.registerObject(oView.byId('username'), true);
        oMM.registerObject(oView.byId('password'), true);

        // Set input icons
        let usernameInput = this.byId('username'),
          passwordInput = this.byId('password');

        usernameInput.addBeginIcon(IconPool.getIconURI('person-placeholder'));
        passwordInput.addBeginIcon(IconPool.getIconURI('key'));
      },
      _validateInput: function (oInput) {
        var sValueState = 'None',
          bValidationError = false,
          oBinding = oInput.getBinding('value');

        try {
          oBinding.getType().validateValue(oInput.getValue());
        } catch (oException) {
          sValueState = 'Error';
          bValidationError = true;
        }

        oInput.setValueState(sValueState);

        return bValidationError;
      },
      OnChange: function (oEvent) {
        var oInput = oEvent.getSource();
        this._validateInput(oInput);
      },
      OnSubmit: function (oEvent) {
        var oView = this.getView(),
          aInputs = [oView.byId('username'), oView.byId('password')],
          bValidationError = false;

        aInputs.forEach(function (oInput) {
          bValidationError = this._validateInput(oInput) || bValidationError;
        }, this);

        if (!bValidationError) {
          const oModel = this.getModel('login');
          const username = oModel.oData.username,
                password = oModel.oData.password;

          const oErrorText = this.byId('errorText');
          oErrorText.$().css('color', Parameters.get('sapUiErrorColor'));

          fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: username,
              password: password
            })
          }).then(res => res.json())
          .then(json => {
            if(!json.success) {
              oModel.setProperty('/message', json.error.message + '.');
            } else {
              oModel.setProperty('/message', '');
            }
          }).catch(error => {
              oModel.setProperty('/message', 'Cant sign in');
          })
        } else {
          // TODO: Handle validation error
        }
      },
      onAfterRendering: function () {
        let borderWidth = Parameters.get('sapUiFieldBorderWidth'),
          borderRadius = Parameters.get('sapUiFieldBorderCornerRadius'),
          borderColor = Parameters.get('sapUiFieldBorderColor');

        const oErrorText = this.byId('errorText');
        oErrorText.$().css({
          color: Parameters.get('sapUiErrorColor')
        });

        const form = this.byId('loginForm');
        form.$().css({
          'border-width': borderWidth,
          'border-color': borderColor,
          'border-radius': borderRadius,
          'border-style': 'solid',
        });
      },
    });
  }
);
