sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'com/piasa/Costos/controller/layout/DialogKostl.controller',
    'sap/ui/core/Fragment',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    'sap/ui/core/format/NumberFormat',
    'sap/ui/core/IconPool',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    ToolHeader,
    DialogKostl,
    Fragment,
    Filter,
    FilterOperator,
    MessageBox,
    MessageToast,
    NumberFormat,
    IconPool,
    ReporteService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte1.controller',
      {
        Header: new ToolHeader(this),
        Dialog: new DialogKostl(this),
        onInit: function () {
          this.getRouter()
            .getRoute('reporte_1')
            .attachMatched(function () {
              ReporteService.getKOSTL()
                .then(
                  function () {
                    if (!this._loaded) {
                      this.resetMultiComboBox();
                      this._loaded = true;
                    }
                  }.bind(this)
                )
                .catch((error) => {
                  MessageBox.error(error.message);
                });
            }, this);

            this.resetDatePicker();
            this.addClearIconMultiComboBox();
        },
        onReset: function() {
          this.resetMultiComboBox();
          this.resetDatePicker();
        },
        onClearMultiComboBox: function() {
          var oMultiComboBox = this.getMultiComboBox();
          oMultiComboBox.setSelectedKeys(null);
        },
        addClearIconMultiComboBox: function() {
          var oMultiComboBox = this.getMultiComboBox();
          var oIcon = IconPool.getIconURI('decline');
          oMultiComboBox.addEndIcon({
            src: oIcon,
            press: this.onClearMultiComboBox.bind(this)
          });
        },
        resetMultiComboBox: function() {
          var oMultiComboBox = this.getMultiComboBox();
          var aSelectedKeys = ReporteService.getKOSTLSelectedKeys();
          oMultiComboBox.setSelectedKeys(aSelectedKeys);
        },
        resetDatePicker: function() {
          var oDatePicker = this.getDatePicker();
          var date = new Date(),
            year = date.getFullYear(),
            month = String(date.getMonth() + 1);
          oDatePicker.setValue(`${year}/${month.padStart(2, '0')}`);
        },
        getMultiComboBox: function () {
          var fragmentId = this.getView().createId('form');
          return Fragment.byId(fragmentId, 'multiComboBox');
        },
        getDatePicker: function () {
          var fragmentId = this.getView().createId('form');
          return Fragment.byId(fragmentId, 'datePicker');
        },
        onReady: function (oEvent) {
          var oMultiComboBox = this.getMultiComboBox(),
            oDatePicker = this.getDatePicker();

          var selected = [];

          var oItems = oMultiComboBox.getSelectedItems();
          oItems.forEach((oItem) => {
            var path = oItem.getBindingContext('reportes').getPath();
            var kostl = ReporteService.getProperty(path + '/KOSTL');
            selected.push(kostl);
          });

          var date = oDatePicker.getValue();
          date = new Date(date);

          var year = date.getFullYear(),
            month = date.getMonth() + 1;

          ReporteService.getReporte1(year, month, selected);
        },
      }
    );
  }
);
