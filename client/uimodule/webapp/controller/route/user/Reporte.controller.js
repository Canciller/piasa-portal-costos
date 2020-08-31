sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/ui/core/IconPool',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    ToolHeader,
    Fragment,
    MessageBox,
    IconPool,
    ReporteService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.resetDatePicker();
          this.addClearIconMultiComboBox();
        },
        getDatePickerDate: function() {
          var oDatePicker = this.getDatePicker();
          return this.parseDate(oDatePicker.getValue());
        },
        getCurrentDate: function () {
          var now = new Date();
          var year = String(now.getFullYear()),
            month = String(now.getMonth() + 1).padStart(2, '0'),
            day = String(now.getDate()).padEnd(2, '0');

          return {
            year: year,
            month: month,
            day: day,
          };
        },
        getCurrentDateStr: function () {
          var date = this.getCurrentDate();

          return `${date.month}/${date.day}/${date.year}`;
        },
        parseDate: function (value) {
          var date = new Date(value);

          var year = date.getFullYear(),
            month = String(date.getMonth() + 1).padStart(2, '0');

          return {
            year: year,
            month: month,
          };
        },
        attachOnReady: function (onReady) {
          if (onReady === undefined || onReady === null)
            this._onReady = undefined;
          else if (onReady instanceof Function) this._onReady = onReady;
        },
        onReset: function () {
          this.resetMultiComboBox();
          this.resetDatePicker();
        },
        onClearMultiComboBox: function () {
          var oMultiComboBox = this.getMultiComboBox();
          oMultiComboBox.setSelectedKeys(null);
        },
        addClearIconMultiComboBox: function () {
          var oMultiComboBox = this.getMultiComboBox();
          var oIcon = IconPool.getIconURI('decline');
          oMultiComboBox.addEndIcon({
            src: oIcon,
            press: this.onClearMultiComboBox.bind(this),
          });
        },
        resetMultiComboBox: function () {
          var oMultiComboBox = this.getMultiComboBox();
          var aSelectedKeys = ReporteService.getKOSTLSelectedKeys();
          oMultiComboBox.setSelectedKeys(aSelectedKeys);
        },
        resetDatePicker: function () {
          var date = this.getCurrentDateStr();
          ReporteService.setProperty('/date', date);
        },
        getMultiComboBox: function () {
          var fragmentId = this.getView().createId('form');
          return Fragment.byId(fragmentId, 'multiComboBox');
        },
        getDatePicker: function () {
          var fragmentId = this.getView().createId('form');
          return Fragment.byId(fragmentId, 'datePicker');
        },
        onReady: function () {
          var oMultiComboBox = this.getMultiComboBox(),
            oDatePicker = this.getDatePicker();

          var selected = [];

          var oItems = oMultiComboBox.getSelectedItems();
          oItems.forEach((oItem) => {
            var path = oItem.getBindingContext('reportes').getPath();
            var kostl = ReporteService.getProperty(path + '/KOSTL');
            selected.push(kostl);
          });

          var date = this.parseDate(oDatePicker.getValue());

          var year = date.year,
            month = date.month;

          if (this._onReady)
            this._onReady({
              kostl: selected,
              year: year,
              month: month,
            }).catch((error) => {
              MessageBox.error(error.message);
            });
        },
      }
    );
  }
);
