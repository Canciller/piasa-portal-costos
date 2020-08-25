sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/ui/layout/form/FormElement',
    'sap/m/Input',
    '../../service/AuthService',
  ],
  function (BaseController, ToolHeader, FormElement, Input, AuthService) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.Settings.controller', {
      Header: new ToolHeader(this),
      onInit: function () {
        this.getRouter()
          .getRoute('settings')
          .attachMatched(function () {
            this.onCancelChangePassword();
            this.setForm(false);
          }, this);

        this._oFormFragments = {};
        //this.setForm(false);
      },
      onEdit: function () {
        this.setForm(true);
        this._saved = Object.assign({}, AuthService.getProperty('/'));
      },
      onSave: function () {
        this.setForm(false);
      },
      onCancel: function () {
        this.setForm(false);
        AuthService.setProperty('/', this._saved);
      },
      onChangePassword: function () {
        var changePassword = AuthService.getProperty('/changePassword');
        AuthService.setProperty('/changePassword', !changePassword);
      },
      onSaveChangePassword: function () {
        AuthService.changePassword();
      },
      onCancelChangePassword: function () {
        AuthService.setProperty('/changePassword', false);
        AuthService.setProperty('/oldPassword', '');
        AuthService.setProperty('/newPassword', '');
        AuthService.setProperty('/newPasswordRepeat', '');
      },
      setForm: function (edit) {
        this.byId('edit').setVisible(!edit);
        this.byId('save').setVisible(edit);
        this.byId('cancel').setVisible(edit);

        this.setFragment(edit ? 'Change' : 'Display');
      },
      setFragment: function (name) {
        this._mode = name;
        var oPage = this.byId('main');
        oPage.removeAllContent();

        var oFormFragment = this._oFormFragments[name];
        if (!oFormFragment) {
          oFormFragment = sap.ui.xmlfragment(
            this.getView().getId(),
            'com.piasa.Costos.view.layout.settings.Settings' + name,
            this
          );
          this._oFormFragments[name] = oFormFragment;
        }

        oPage.insertContent(oFormFragment);
      },
    });
  }
);
