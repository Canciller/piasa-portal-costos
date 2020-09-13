sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
) {
  'use strict';

  return APIService.extend('com.piasa.Costos.ReporteService', {
    constructor: function () {
      this.setBaseUrl('/api/v1/reportes');
      this.setModel(
        new JSONModel({
          data: [],
          tree: [],
          empty: true,
          enabled: false,
          detail: {
            date: [],
            empty: true,
          },
          kostl: {
            data: [],
            selectedKeys: [],
            enabled: false,
          },
          verak: {
            data: [],
            selectedKeys: [],
            enabled: false,
          },
          abtei: {
            data: [],
            selectedKeys: [],
            enabled: false,
          },
        })
      );
    },

    /**
     * Util
     */

    setReporteUrl(url) {
      this._reporteUrl = url;
    },
    getReporteUrl() {
      return this._reporteUrl;
    },
    isEnabled: function (prop) {
      if (!prop) {
        return this.getProperty('/enabled');
      } else {
        return this.getProperty('/' + prop + '/enabled');
      }
    },
    setEnabled: function (enabled, prop) {
      if (enabled) this.enable(prop);
      else this.disable(prop);
    },
    enable: function (prop) {
      if (!prop) {
        this.setProperty('/enabled', true);
      } else {
        this.setProperty('/' + prop + '/enabled', true);
      }
    },
    disable: function (prop) {
      if (!prop) {
        this.setProperty('/enabled', false);
      } else {
        this.setProperty('/' + prop + '/enabled', false);
      }
    },
    disableAll: function () {
      this.disable();
      this.disable('abtei');
      this.disable('verak');
      this.disable('kostl');
    },
    setEmpty: function (empty, prop) {
      if (!prop) {
        this.setProperty('/empty', empty);
      } else {
        this.setProperty('/' + prop + '/empty', empty);
      }
    },
    fromDetail: function () {
      return this.getProperty('/fromDetail');
    },
    setFromDetail: function (fromDetail) {
      this.setProperty('/fromDetail', fromDetail);
    },
    fromReporte: function () {
      return this.getProperty('/fromReporte');
    },
    setFromReporte: function (fromReporte) {
      this.setProperty('/fromReporte', fromReporte);
    },
    clearAll: function () {
      this.disableAll();

      this.setProperty('/kostl/data', []);
      this.setEmpty(true, 'kostl');

      this.setProperty('/verak/data', []);
      this.setEmpty(true, 'veark');

      this.setProperty('/abtei/data', []);
      this.setEmpty(true, 'abtei');

      this.setDESC1(null);

      this.setSelectedKeys('abtei', []);
      this.setSelectedKeys('verak', []);
      this.setSelectedKeys('kostl', []);
    },

    /**
     * Properties
     */

    getDESC1: function () {
      return this.getProperty('/desc1');
    },
    getDESC1_: function () {
      return this.getProperty('/desc1_');
    },
    getDESC2: function () {
      return this.getProperty('/desc2');
    },
    getDESC2_: function () {
      return this.getProperty('/desc2_');
    },
    setDESC1: function (desc1) {
      this.setProperty('/desc1', desc1);
      if(desc1) {
        var len = desc1.length;
        this.setProperty('/desc1_', desc1.substr(3, len));
      } else {
        this.setProperty('/desc1_', null);
      }
    },
    setDESC2: function (desc2) {
      this.setProperty('/desc2', desc2);
    },
    setDate: function (date) {
      this.setProperty('/date', date);
    },
    getDate: function () {
      var value = this.getProperty('/date');

      var date = new Date(value);
      var year = String(date.getFullYear()),
        month = String(date.getMonth() + 1).padStart(2, '0'),
        day = String(date.getDate()).padStart(2, '0');

      return {
        year: year,
        month: month,
        day: day,
      };
    },
    getDateStr: function () {
      return this.getProperty('/date');
    },
    getDateLastYearStr: function () {
      var date = this.getDate();
      var year = Number(date.year) - 1;
      return `${date.month}/${date.day}/${year}`;
    },
    setParamsLoading: function (loading) {
      this.setLoading(loading, '/abtei');
      this.setLoading(loading, '/verak');
      this.setLoading(loading, '/kostl');
    },
    setParam: function (property, values) {
      this.setProperty('/' + property + '/data', values);
      this.setEnabled(values.length !== 0, property);
    },
    getParam: function (prop) {
      return this.getProperty('/' + prop + '/data');
    },
    setSelectedKeys: function (property, selectedKeys) {
      this.setProperty('/' + property + '/selectedKeys', selectedKeys);
      this.setEmpty(selectedKeys.length === 0, property);
    },
    getSelectedKeys: function (property) {
      return this.getProperty('/' + property + '/selectedKeys');
    },
    isReporteEmpty: function () {
      return this.getProperty('/empty');
    },

    /**
     * Service
     */

    getDefaultParams: async function () {
      try {
        this.setParamsLoading(true);

        var params = await this.api('/params').get();

        return params;
      } catch (error) {
        throw error;
      } finally {
        this.setParamsLoading(false);
      }
    },
    getFilteredParams: async function (abtei, verak) {
      try {
        this.setParamsLoading(true);

        var params = await this.api('/params/filtered').post({
          abtei: abtei,
          verak: verak,
        });

        return params;
      } catch (error) {
        throw error;
      } finally {
        this.setParamsLoading(false);
      }
    },
    abort: function() {
      if(!this._controller) return;
      this._controller.abort();
    },
    fillReporteDetail: async function () {
      var url = this.getReporteUrl();

      var isBudget = this.getProperty('/isBudget');
      var desc1 = this.getDESC1(),
        desc2 = this.getDESC2(),
        kostl = this.getSelectedKeys('kostl');

      if (kostl.length === 0 || !desc1) return;

      var date = this.getDate();
      var year = date.year,
        month = date.month;

      var route = isBudget ? '/budget' : '/real';
      route = url + route;

      try {
        this.setLoading(true, '/detail');

        this._controller = new AbortController();

        var detail = await this.api(route).post({
          kostl: kostl,
          desc1: desc1,
          desc2: desc2,
          year: year,
          month: month,
        }, {
          signal: this._controller.signal
        });

        this.setProperty('/detail/data', detail);
        this.setProperty('/detail/empty', detail.length === 0);
      } catch (error) {
        if(error.name !== 'AbortError')
          throw error;
      } finally {
        this.setLoading(false, '/detail');
      }
    },
    fillReporte: async function () {
      var url = this.getReporteUrl();

      try {
        this.setLoading(true);

        var date = this.getDate(),
          kostl = this.getSelectedKeys('kostl');

        if (kostl.length === 0) return;

        var year = date.year,
          month = date.month;

        this._controller = new AbortController();

        var reporte = await this.api(url).post({
          year: year,
          month: month,
          kostl: kostl,
        }, {
          signal: this._controller.signal
        });

        /*
        var totals =  {};
        var data = {
          data: []
        }
        if(reporte.length > 0) {
          var k = 0;
          var DESC2 = reporte[0].DESC2;
          totals[DESC2] = Object.assign({}, reporte[0]);
          data.data.push({
            DESC1_: DESC2,
            data: [
              reporte[0]
            ]
          });

          var keys = [
            'Actual_CY',
            'Budget_CY',
            'Actual_LY',
            'Budget_LY',
            'Actual_Accum_CY',
            'Budget_Accum_CY',
            'Actual_Accum_LY',
            'Budget_Accum_LY',
            'Var_vs_Ppto_CY',
            'Var_vs_AA_CY',
            'Var_vs_Ppto_LY',
            'Var_vs_AA_LY',
          ];
          for(var i = 1; i <= reporte.length - 1; i++) {
            var el = reporte[i];
            if(DESC2 !== el.DESC2) {
              for(var j = keys.length; j--;) {
                var key = keys[j];
                data.data[k][key] = totals[DESC2][key];
              }

              data.data[k]['Percentage_1_CY'] = '';
              data.data[k]['Percentage_2_CY'] = '';
              data.data[k]['Percentage_1_LY'] = '';
              data.data[k]['Percentage_2_LY'] = '';

              k++;
              DESC2 = el.DESC2;
              data.data.push({
                DESC1_: DESC2,
                data: [ el ]
              });
              totals[DESC2] = Object.assign({}, el);
              continue;
            }

            for(var j = keys.length; j--;) {
              var key = keys[j];
              var value = totals[DESC2][key];
              var type = typeof(value);
              if(type === 'number') {
                totals[DESC2][key] += el[key];
              }
            }

            data.data[k].data.push(el);
          }

          for(var j = keys.length; j--;) {
            var key = keys[j];
            data.data[k][key] = totals[DESC2][key];
          }

          data.data[k]['Percentage_1_CY'] = '';
          data.data[k]['Percentage_2_CY'] = '';
          data.data[k]['Percentage_1_LY'] = '';
          data.data[k]['Percentage_2_LY'] = '';

          //console.log(totals);
          //console.log(data);
        }
        */

        //this.setProperty('/tree', data);
        this.setProperty('/data', reporte);
        this.setProperty('/empty', reporte.length === 0);
      } catch (error) {
        if(error.name !== 'AbortError')
          throw error;
      } finally {
        this.setLoading(false);
      }
    },
  });
});
