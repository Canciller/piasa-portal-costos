sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'sap/ui/core/Fragment',
    'sap/m/Token',
    '../../service/ReporteService',
  ],
  function (BaseController, Fragment, Token, ReporteService) {
    'use strict';

    return BaseController.extend('com.piasa.Costos.DialogKostl.controller', {
      handleValueHelpSearch: function (oEvent) {},
      handleValueHelpConfirm: function (oEvent) {
        var aSelectedItems = oEvent.getParameter('selectedItems'),
          oMultiInput = this.getMultiInput();

        ReporteService.unselectAll();

        oMultiInput.removeAllTokens();
        if (aSelectedItems && aSelectedItems.length > 0) {
          aSelectedItems.forEach(function (oItem) {
            var path = oItem.getBindingContext('reportes').getPath();
            ReporteService.setProperty(path + '/selected', true);
            oMultiInput.addToken(
              new Token({
                text: oItem.getTitle(),
                key: path,
              })
            );
          });
        }
      },
      handleValueHelpCancel: function (oEvent) {},
    });
  }
);
