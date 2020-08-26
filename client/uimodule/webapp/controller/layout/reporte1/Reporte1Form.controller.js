sap.ui.define(
  ['com/piasa/Costos/controller/BaseController', 'sap/ui/core/Fragment'],
  function (BaseController, Fragment) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.Reporte1Form.controller', {
      onReady: function (oEvent) {
        console.log('ready');
      },
      handleValueHelp: function (oEvent) {
        var sInputValue = oEvent.getSource().getValue();

        console.log(this);
        // create value help dialog
        if (!this._valueHelpDialog) {
          Fragment.load({
            id: 'valueHelpDialog',
            name: 'com.piasa.Costos.view.layout.DialogKostl',
            controller: this,
          }).then(
            function (oValueHelpDialog) {
              this._valueHelpDialog = oValueHelpDialog;
              this.getView().addDependent(this._valueHelpDialog);
              this.openValueHelpDialog(sInputValue);
            }.bind(this)
          );
        } else {
          this.openValueHelpDialog(sInputValue);
        }
      },
      openValueHelpDialog: function (sInputValue) {
        // create a filter for the binding
        this._valueHelpDialog
          .getBinding('items')
          .filter([new Filter('KOSTL', FilterOperator.Contains, sInputValue)]);

        // open value help dialog filtered by the input value
        this._valueHelpDialog.open(sInputValue);
      },
    });
  }
);
