sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/ui/core/Fragment',
    'sap/m/MessageBox',
    'sap/ui/core/IconPool',
  ],
  function (BaseController, ToolHeader, Fragment, MessageBox, IconPool) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.setFormControls();
          this.addSelectAllIcon();
          this.addClearIcon();
        },
        formatDESC1: function (value) {
          if (!value) return '';
          var len = value.length;
          return value.substr(3, len);
        },
        setFormControls: function () {
          this._oForm = {
            abtei: this.byId('ABTEI'),
            verak: this.byId('VERAK'),
            kostl: this.byId('KOSTL'),
            date: this.byId('datePicker'),
          };

          this._filter = {};
          var filter = this._filter;
          
          this._testFilter = (sTerm, sText) => {
	            return new RegExp("^" + sTerm, "i").test(sText);
          }
          var testFilter = this._testFilter;

          var setFilterFunction = function(key, oControl) {
            oControl.setFilterFunction(function(sTerm, oItem) {
              filter[key] = sTerm;
              return testFilter(sTerm, oItem.getText());
            });
          }

          setFilterFunction('abtei', this._oForm.abtei);
          setFilterFunction('verak', this._oForm.verak);
          setFilterFunction('kostl', this._oForm.kostl);
        },
        addSelectAllIcon: function () {
          var oIcon = IconPool.getIconURI('activities');

          var onSelectAll = function (key, oControl, filterProp) {
            //oControl.setSelectedItems(oControl.getItems());
            //oControl.close();
            //console.log(this.getParam(key));
            //console.log(this.getSelectedKeys(key));

            var lastSelectedKeys = this.getSelectedKeys(key);
            var filteredKeys = this.getFilteredKeys(key, filterProp);
            var selectedKeys = Array.from(new Set(lastSelectedKeys.concat(filteredKeys)));
            //var selectedKeys = lastSelectedKeys.concat(filteredKeys);

            this.setSelectedKeys(key, selectedKeys);
            //oControl.addSelectedKeys(selectedKeys);

            // TODO: This call is probably needed.
            //this.setSelectedKeys(key, []);

            // TODO: If is closed do not open it.
            // TODO: Change this sort of a hack to refresh list.
            this.refreshFilter(oControl);

            switch (key) {
              case 'abtei':
                this.onChangeABTEI();
                break;
              case 'verak':
                this.onChangeVERAK();
                break;
              case 'kostl':
                this.onChangeKOSTL();
              default:
                break;
            }
          }.bind(this);

          var addEndIcon = function (oControl, key, filterProp) {
            oControl.addEndIcon({
              src: oIcon,
              press: function () {
                onSelectAll(key, oControl, filterProp);
              }.bind(this),
            });
          };

          var abtei = this._oForm.abtei,
            verak = this._oForm.verak,
            kostl = this._oForm.kostl;

          addEndIcon(abtei, 'abtei', 'ABTEI');
          addEndIcon(verak, 'verak', 'VERAK');
          addEndIcon(kostl, 'kostl', 'LTEXT');
        },
        addClearIcon: function () {
          var oIcon = IconPool.getIconURI('decline');

          var onClear = function (key, oControl, filterProp) {
            this._filter[key] = undefined;
            this.setSelectedKeys(key, []);

            this.refreshFilter(oControl);

            switch (key) {
              case 'abtei':
                this.onChangeABTEI();
                break;
              case 'verak':
                this.onChangeVERAK();
                break;
              case 'kostl':
                this.onChangeKOSTL();
              default:
                break;
            }
          }.bind(this);

          var addEndIcon = function (oControl, key, filterProp) {
            oControl.addEndIcon({
              src: oIcon,
              press: function () {
                onClear(key, oControl, filterProp);
              }.bind(this),
            });
          };

          var abtei = this._oForm.abtei,
            verak = this._oForm.verak,
            kostl = this._oForm.kostl;

          addEndIcon(abtei, 'abtei', 'ABTEI');
          addEndIcon(verak, 'verak', 'VERAK');
          addEndIcon(kostl, 'kostl', 'LEXT');
        },

        /**
         * Util
         */

        clearAll: function () {
          var ReporteService = this.getService();
          ReporteService.clearAll();
        },
        setService: function (ReporteService) {
          this._ReporteService = ReporteService;
        },
        getService: function () {
          return this._ReporteService;
        },
        setParam: function (prop, values, key) {
          var ReporteService = this.getService();
          ReporteService.setParam(prop, values);
          var selectedKeys = [];
          for (var i = 0; i < values.length; i++) {
            var value = values[i];
            selectedKeys.push(value[key]);
          }
          this.setSelectedKeys(prop, selectedKeys);
        },
        getParam: function(prop) {
          return this.getService().getParam(prop);
        },
        getFilteredKeys: function(prop, filterProp) {
          const filteredKeys = this.getService().getFilteredKeys(prop, filterProp, this._filter[prop], this._testFilter);
          this._filter[prop] = undefined;
          return filteredKeys;
        },
        setSelectedKeys: function (prop, selectedKeys) {
          this.getService().setSelectedKeys(prop, selectedKeys);
        },
        createSelectedKeys: function (prop, key) {
          var control = this._oForm[prop];
          var items = control.getSelectedItems();

          var selectedKeys = [];
          for (var i = items.length; i--; ) {
            var item = items[i];
            var path = item.getBindingContext('r1').getPath();
            var value = this.getService().getProperty(path + '/' + key);
            selectedKeys.push(value);
          }

          this.setSelectedKeys(prop, selectedKeys);
          control.setSelectedKeys(selectedKeys);

          return selectedKeys;
        },
        getSelectedKeys(prop, key) {
          return this.getService().getSelectedKeys(prop);
        },
        isEnabled: function (prop) {
          return this.getService().isEnabled(prop);
        },
        enable: function (prop) {
          this.getService().enable(prop);
        },
        disable: function (prop) {
          this.getService().disable(prop);
        },
        disableAll: function () {
          this.getService().disableAll();
        },
        fromDetail: function () {
          return this.getService().fromDetail();
        },
        setFromDetail: function (fromDetail) {
          this.getService().setFromDetail(fromDetail);
        },
        isLoading: function (prop) {
          if (!prop) {
            return this.getService().getProperty('/loading');
          } else {
            return this.getService().getProperty('/' + prop + '/loading');
          }
        },

        /**
         * Form Util
         */

        resetDatePicker: function () {
          var now = new Date();
          var year = String(now.getFullYear()),
            month = String(now.getMonth() + 1).padStart(2, '0'),
            day = String(now.getDate()).padStart(2, '0');

          var date = `${month}/${day}/${year}`;
          var ReporteService = this.getService();

          ReporteService.setDate(date);
        },
        resetForm: async function () {
          this.resetDatePicker();

          var params = await this.getService().getDefaultParams();

          this.getService().setModelSize(
            Math.max(
              params.abtei.length,
              params.verak.length,
              params.kostl.length
            )
          );

          this.setParam('abtei', params.abtei, 'ABTEI');
          this.setParam('verak', params.verak, 'VERAK');
          this.setParam('kostl', params.kostl, 'KOSTL');
        },
        loadForm: async function () {
          var abtei = this.getSelectedKeys('abtei', 'ABTEI'),
            verak = this.getSelectedKeys('verak', 'VERAK');

          var kostl = [];
          if (verak.length !== 0) {
            var params = await this.getService().getFilteredParams(
              abtei,
              verak
            );
            kostl = params.kostl;
          }

          this.setParam('kostl', kostl, 'KOSTL');
        },
        refreshFilter: function(oControl) {
          if(oControl.isOpen()) {
            oControl.close();
            oControl.open();
          }
        },

        /**
         * Attach Events
         */

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

        /**
         * Events
         */

        onChangeABTEI: async function () {
          var abtei = this.getSelectedKeys('abtei');

          var params = await this.getService().getFilteredParams(abtei);

          this.setParam('verak', params.verak, 'VERAK');
          this.setParam('kostl', params.kostl, 'KOSTL');
          this.getService().setEmpty(params.kostl.length === 0, 'kostl');
        },
        onChangeVERAK: async function () {
          var abtei = this.getSelectedKeys('abtei'),
            verak = this.getSelectedKeys('verak');

          var kostl = [];
          if (verak.length !== 0) {
            var params = await this.getService().getFilteredParams(
              abtei,
              verak
            );
            kostl = params.kostl;
          }

          this.setParam('kostl', kostl, 'KOSTL');
          this.getService().setEmpty(kostl.length === 0, 'kostl');
        },
        onChangeKOSTL: function () {
          var kostl = this.getSelectedKeys('kostl');
          this.getService().setEmpty(kostl.length === 0, 'kostl');
        },
        onDisplay: async function () {
          try {
            if (this.isEnabled()) {
              await this.loadForm();
            } else {
              await this.resetForm();
            }

            this.enable();

            await this.onReady();
          } catch (error) {
            this.disableAll();

            MessageBox.error(error.message);
            console.error(error);
          } finally {
            this.getService().setDESC1(null);
          }
        },
        onReady: async function () {
          try {
            if (this._onReady) await this._onReady();
          } catch (error) {
            MessageBox.error(error.message);
            console.error(error);
          }
        },
        onExport: function () {
          if (this._onExport)
            this._onExport().catch((error) => {
              MessageBox.error(error.message);
              console.error(error);
            });
        },
      }
    );
  }
);
