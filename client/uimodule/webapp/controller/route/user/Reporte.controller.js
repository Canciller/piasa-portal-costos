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
          this.addSelectAllIconMultiComboBox();
          this.addClearIconMultiComboBox();
        },
        isLoaded: function () {
          return this._loaded;
        },
        setLoaded: function (loaded) {
          this._loaded = loaded;
        },
        getDatePickerDate: function () {
          var oDatePicker = this.getDatePicker();
          return this.parseDate(oDatePicker.getValue());
        },
        getCurrentDate: function () {
          var now = new Date();
          var year = String(now.getFullYear()),
            month = String(now.getMonth() + 1).padStart(2, '0'),
            day = String(now.getDate()).padStart(2, '0');

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
        attachOnExport: function (onExport) {
          if (onExport === undefined || onExport === null)
            this._onExport = undefined;
          else if (onExport instanceof Function) this._onExport = onExport;
        },
        onReset: function () {
          this.resetMultiComboBox();
          this.resetDatePicker();
        },
        onClearMultiComboBox: function (key) {
          var oControl = this.getMultiComboBox(key);
          if (!oControl) return;

          oControl.setSelectedKeys(null);

          switch (key) {
            case 'abtei':
              this.onChangeABTEI();
              break;
            case 'verak':
              this.onChangeVERAK();
              break;
            default:
              break;
          }
        },
        addClearIconMultiComboBox: function () {
          var oMultiComboBoxes = this.getMultiComboBoxes(),
            oIcon = IconPool.getIconURI('decline');

          Object.keys(oMultiComboBoxes).forEach(
            function (key) {
              var oControl = oMultiComboBoxes[key];

              oControl.addEndIcon({
                src: oIcon,
                press: function () {
                  this.onClearMultiComboBox(key);
                }.bind(this),
              });
            }.bind(this)
          );
        },
        addSelectAllIconMultiComboBox: function () {
          var oMultiComboBoxes = this.getMultiComboBoxes(),
            oIcon = IconPool.getIconURI('activities');

          Object.keys(oMultiComboBoxes).forEach(
            function (key) {
              var oControl = oMultiComboBoxes[key];

              oControl.addEndIcon({
                src: oIcon,
                press: function () {
                  console.log('SELECT ALL');
                }.bind(this),
              });
            }.bind(this)
          );
        },
        resetMultiComboBox: function () {
          var oMultiComboBoxes = this.getMultiComboBoxes();
          Object.keys(oMultiComboBoxes).forEach((key) => {
            var oControl = oMultiComboBoxes[key];
            var aSelectedKeys = ReporteService.getSelectedKeys(key);
            oControl.setSelectedKeys(aSelectedKeys);
          });
          /*
          var oMultiComboBox = this.getMultiComboBoxKOSTL();
          var aSelectedKeys = ReporteService.getKOSTLSelectedKeys();
          oMultiComboBox.setSelectedKeys(aSelectedKeys);
          */
        },
        resetDatePicker: function () {
          var date = this.getCurrentDateStr();
          ReporteService.setProperty('/date', date);
        },
        getMultiComboBoxes: function () {
          if (!this._oMultiComboBoxes)
            this._oMultiComboBoxes = {
              abtei: this.getMultiComboBoxABTEI(),
              verak: this.getMultiComboBoxVERAK(),
              kostl: this.getMultiComboBoxKOSTL(),
            };

          return this._oMultiComboBoxes;
        },
        getMultiComboBox: function (key) {
          var oMultiComboBoxes = this.getMultiComboBoxes();
          return oMultiComboBoxes[key];
        },
        getMultiComboBoxABTEI: function () {
          return this.byId('ABTEI');
        },
        getMultiComboBoxVERAK: function () {
          return this.byId('VERAK');
        },
        getMultiComboBoxKOSTL: function () {
          return this.byId('KOSTL');
        },
        getDatePicker: function () {
          return this.byId('datePicker');
        },
        onExport: function () {
          if (this._onExport)
            this._onExport().catch((error) => {
              MessageBox.error(error.message);
              console.error(error);
            });
        },
        getSelectedKeys: function (key) {
          var oControl = this.getMultiComboBox(key);
          if (!oControl) return [];

          var selectedKeys = [];
          var oItems = oControl.getSelectedItems();
          for (var i = oItems.length; i--; ) {
            var oItem = oItems[i];
            var path = oItem.getBindingContext('reportes').getPath();
            var value = ReporteService.getProperty(
              path + '/' + String(key).toUpperCase()
            );
            selectedKeys.push(value);
          }

          return selectedKeys;
        },
        setSelectedKeys: function (key, selectedKeys) {
          var oControl = this.getMultiComboBox(key);
          if (!oControl) return [];

          oControl.setSelectedKeys(selectedKeys);
        },
        onChangeABTEI: async function () {
          try {
            var abtei = this.getSelectedKeys('abtei');

            var params = await ReporteService.getParamsFiltered({
              abtei: abtei,
            });

            this.setSelectedKeys(
              'verak',
              ReporteService.evaluateSelectedKeys(params.verak, 'VERAK')
            );
            this.setSelectedKeys(
              'kostl',
              ReporteService.evaluateSelectedKeys(params.kostl, 'KOSTL')
            );
            ReporteService.setProperty('/verak/data', params.verak);
            ReporteService.setProperty('/kostl/data', params.kostl);
          } catch (error) {
            MessageBox.error(error.message);
            console.error(error);
          }
        },
        onChangeVERAK: async function () {
          try {
            var abtei = this.getSelectedKeys('abtei'),
              verak = this.getSelectedKeys('verak');

            if (verak.length !== 0) {
              var params = await ReporteService.getParamsFiltered({
                abtei: abtei,
                verak: verak,
              });

              this.setSelectedKeys(
                'kostl',
                ReporteService.evaluateSelectedKeys(params.kostl, 'KOSTL')
              );
              ReporteService.setProperty('/kostl/data', params.kostl);
            } else {
              this.setSelectedKeys('kostl', []);
              ReporteService.setProperty('/kostl/data', []);
            }
          } catch (error) {
            MessageBox.error(error.message);
            console.error(error);
          }
        },
        onChangeKOSTL: async function () {},
        onReady: async function () {
          var oMultiComboBoxes = this.getMultiComboBoxes();

          var selected = {};
          Object.keys(oMultiComboBoxes).forEach((key) => {
            if (!selected[key]) selected[key] = [];

            var oControl = oMultiComboBoxes[key];
            var oItems = oControl.getSelectedItems();
            for (var i = oItems.length; i--; ) {
              var oItem = oItems[i];
              var path = oItem.getBindingContext('reportes').getPath();
              var value = ReporteService.getProperty(
                path + '/' + String(key).toUpperCase()
              );
              selected[key].push(value);
            }
          });

          var date = this.getDatePickerDate();

          var year = date.year,
            month = date.month;

          var payload = {
            abtei: selected.abte,
            verak: selected.verak,
            kostl: selected.kostl,
            year: year,
            month: month,
          };

          try {
            if (this._onReady) await this._onReady(payload);
          } catch (error) {
            MessageBox.error(error.message);
            console.error(error);
          }
        },
      }
    );
  }
);
