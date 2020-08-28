sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/layout/form/FormElement',
    'sap/m/Input',
    '../../service/AuthService',
  ],
  function (BaseController,
    ToolHeader,
    Fragment,
    MessageBox,
    MessageToast,
    FormElement,
    Input, 
    AuthService) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.Settings.controller', {
      Header: new ToolHeader(this),
      onInit: function () {
        this.getRouter()
          .getRoute('settings')
          .attachMatched(function () {
            this.onCancelChangePassword();
            this.onCancel();
            this.resetInputs();
          }, this);
      },
      resetInput: function(id) {
        var oInput = this.byId(id);
        oInput.setValueState('None');
        oInput.setValueStateText(undefined);
      },
      resetInputs: function() {
          var aInput = [
            'oldPasswordInput',
            'newPasswordInput',
            'newPasswordRepeatInput',
            'emailInput',
            'usernameInput',
            'nameInput'
          ];

          var that = this;
          aInput.forEach(id => {
            that.resetInput.bind(that, id)();
          });
      },
      resetPasswordInputs: function() {
          var aInput = [
            'oldPasswordInput',
            'newPasswordInput',
            'newPasswordRepeatInput',
          ];

          var that = this;
          aInput.forEach(id => {
            that.resetInput.bind(that, id)();
          });
      },
      resetUserInputs: function() {
          var aInput = [
            'emailInput',
            'usernameInput',
            'nameInput',
          ];

          var that = this;
          aInput.forEach(id => {
            that.resetInput.bind(that, id)();
          });
      },
      onEdit: function () {
        this._saved = Object.assign({}, AuthService.getProperty('/'));
        AuthService.setProperty('/changeUser', true);
      },
      onSave: async function () {
        try {
          var aInput = [
            'nameInput',
            'usernameInput',
            'emailInput'
          ];

          var error = false;
          var that = this;
          aInput.forEach(id => {
            var oInput = that.byId(id);

            var value = oInput.getValue(),
              state = 'None',
              text = undefined;

            if(value === '') {
              if(!error) oInput.focus();

              state = 'Error';
              text = 'Este campo es requerido.'
              error = true;
            }

            oInput.setValueState(state);
            oInput.setValueStateText(text);
          });

          if(error) return;

          await AuthService.changeUser();

          MessageToast.show('La información de usuario fue guardada exitosamente.');
          this._saved = undefined;
          this.onCancel();
        } catch(error) {
          var msg = error.message;
          if(error.details)
            error.details.errors.forEach(detail => msg += '\n* ' + detail.msg);
          MessageBox.error(msg);
        }
      },
      onCancel: function () {
        AuthService.setProperty('/changeUser', false);

        if(this._saved) {
          AuthService.setProperty('/username', this._saved.username);
          AuthService.setProperty('/name', this._saved.name);
          AuthService.setProperty('/email', this._saved.email);
        }

        this.resetUserInputs();
      },
      onSaveChangePassword: async function () {
        try {
          var aInput = [
            'oldPasswordInput',
            'newPasswordInput',
            'newPasswordRepeatInput'
          ];

          var error = false;
          var that = this;
          aInput.forEach(id => {
            var oInput = that.byId(id);

            var value = oInput.getValue(),
              state = 'None',
              text = undefined;

            if(value === '') {
              if(!error) oInput.focus();

              state = 'Error';
              text = 'Este campo es requerido.'
              error = true;
            }

            oInput.setValueState(state);
            oInput.setValueStateText(text);
          });

          if(error) return;

          await AuthService.changePassword();

          MessageToast.show('La contraseña fue cambiada exitosamente.');
          this.onCancelChangePassword();
        } catch(error) {
          var msg = error.message;
          if(error.details)
            error.details.errors.forEach(detail => msg += '\n* ' + detail.msg);
          MessageBox.error(msg);
        }
      },
      onCancelChangePassword: function () {
        AuthService.setProperty('/changePassword', false);
        AuthService.setProperty('/oldPassword', '');
        AuthService.setProperty('/newPassword', '');
        AuthService.setProperty('/newPasswordRepeat', '');

        this.resetPasswordInputs();
      },
      onChangeInput: function(oEvent) {
        var oParams = oEvent.getParameters();
        var oInput = this.byId(oParams.id);
        if(oParams.newValue === '') {
          oInput.setValueState('Error');
          oInput.setValueStateText('Este campo es requerido.');
        }
      },
      onChangePassword: function(oEvent) {
        var oNewInput = this.byId('newPasswordInput'),
          oRepeatInput = this.byId('newPasswordRepeatInput');

        var oParams = oEvent.getParameters();
        var newPasswordRepeat = AuthService.getProperty('/newPasswordRepeat'),
          newPassword = AuthService.getProperty('/newPassword');

        var state = 'Error',
          text = 'Las contraseñas no coinciden.';
        if(oParams.newValue === newPasswordRepeat ||
          oParams.newValue === newPassword) {
            state = 'Success';
            text = undefined;
          }

        oNewInput.setValueState(state);
        oNewInput.setValueStateText(text);
        oRepeatInput.setValueState(state);
        oRepeatInput.setValueStateText(text);

        this.onChangeInput.bind(this)(oEvent);
      },
    });
  }
);
