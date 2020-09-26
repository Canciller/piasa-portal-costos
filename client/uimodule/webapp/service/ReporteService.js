sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
) {
  'use strict';

  var ReporteService = APIService.extend('com.piasa.Costos.ReporteService', {
    constructor: function () {
      this.setBaseUrl('api/v1/reportes');
      this.setModel(
        new JSONModel({
          reporte1: {
            data: [],
            empty: true,
          },
          reporte1Detail: {
            data: [],
            empty: true,
          },
          reporte2: {
            data: [],
            empty: true,
          },
          kostl: {
            data: [],
          },
          verak: {
            data: [],
          },
          abtei: {
            data: [],
          },
        })
      );
    },

    /**
     * Util
     */

    setFromDetail: function (fromDetail) {
      this.setProperty('/reporte1/fromDetail', fromDetail);
    },
    fromDetail: function () {
      return this.getProperty('/reporte1/fromDetail');
    },
    isEnabled: function () {
      return this.getProperty('/enabled');
    },
    enable: function () {
      this.setProperty('/enabled', true);
    },
    disable: function () {
      this.setProperty('/enabled', false);
    },

    /**
     * Reporte 1 Detail
     */

    isReporte1DetailEmpty: function () {
      var reporte1 = this.getProperty('/reporte1Detail/data');
      if (!(reporte1 instanceof Array)) return true;
      return reporte1.length === 0;
    },
    setReporte1DetailPath: function (path) {
      this.setProperty('/reporte1Detail/path', path);
    },
    getReporte1Detail: async function (params) {
      var isBudget = params.isBudget,
        isLastYear = params.isLastYear,
        desc1 = params.desc1,
        month = this.getProperty('/reporte1Detail/month'),
        year = this.getProperty('/reporte1Detail/year'),
        kostl = this.getProperty('/reporte1Detail/kostl'),
        hkont = this.getProperty('/reporte1Detail/hkont'),
        date = isLastYear ? `${year - 1}/${month}` : `${year}/${month}`;

      this.setProperty(
        '/reporte1Detail/selectedYear',
        isLastYear ? year - 1 : year
      );
      this.setProperty('/reporte1Detail/desc1', desc1);
      this.setProperty('/reporte1Detail/date', date);

      var route = isBudget ? '/1/budget' : '/1/real';

      try {
        this.setProperty('/reporte1Detail/loading', true);

        var detail = await this.api(route).post({
          kostl: kostl,
          hkont: hkont,
          desc1: desc1,
          year: isLastYear ? year - 1 : year,
          month: month,
        });

        this.setProperty('/reporte1Detail/data', detail);
        return detail;
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/reporte1Detail/loading', false);
      }
    },

    /**
     * Reporte 1
     */

    isReporte1Empty: function () {
      var reporte1 = this.getProperty('/reporte1/data');
      if (!(reporte1 instanceof Array)) return true;
      return reporte1.length === 0;
    },
    getReporte1: async function (params) {
      var year = params.year,
        month = params.month,
        kostl = params.kostl;

      try {
        this.setProperty('/reporte1Detail/year', year);
        this.setProperty('/reporte1Detail/month', month);
        this.setProperty('/reporte1Detail/kostl', kostl);
        this.setProperty('/reporte1/loading', true);

        if (!(kostl instanceof Array) || kostl.length === 0)
          throw new Error('Selecciona al menos un centro de costo.');

        var reporte = await this.api('/1').post({
          year: year,
          month: month,
          kostl: kostl,
        });

        this.setProperty('/reporte1/data', reporte);
        this.setProperty('/reporte1/empty', reporte.length === 0);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/reporte1/loading', false);
      }
    },

    /**
     *  Reporte 2
     */

    getReporte2: async function (params) {
      var year = params.year,
        kostl = params.kostl;

      try {
        this.setProperty('/reporte2/loading', true);
        this.setProperty('/reporte2/year', year);

        if (!(kostl instanceof Array) || kostl.length === 0)
          throw new Error('Selecciona al menos un centro de costo.');

        var reporte = await this.api('/2').post({
          year: year,
          kostl: kostl,
        });

        this.setProperty('/reporte2/data', reporte);
        this.setProperty('/reporte2/empty', reporte.length === 0);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/reporte2/loading', false);
      }
    },

    /**
     * KOSTL
     */

    getKOSTLSelectedKeys: function () {
      return this.getProperty('/kostl/selectedKeys');
    },
    getStoredKOSTL: function () {
      return this.getProperty('/kostl/data');
    },
    setKOSTL: function (kostl) {
      if (!(kostl instanceof Array)) return;
      this.model.setSizeLimit(kostl.length);
      this.setProperty('/kostl/data', kostl);

      var selectedKeys = [];
      for (var i = kostl.length; i--; ) {
        selectedKeys.push(kostl[i].KOSTL);
      }

      this.setProperty('/kostl/selectedKeys', selectedKeys);
    },
    getKOSTL: async function () {
      try {
        this.setProperty('/kostl/loading', true);
        var kostl = await this.api('/kostl').get();
        this.setKOSTL(kostl);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/kostl/loading', false);
      }
    },

    /**
     * ATEI -> VERAK -> KOSTL
     */

    setParamsLoading: function (loading) {
      this.setProperty('/abtei/loading', loading);
      this.setProperty('/verak/loading', loading);
      this.setProperty('/kostl/loading', loading);
    },
    getSelectedKeys: function (key) {
      try {
        return this.getProperty('/' + key + '/selectedKeys');
      } catch {
        return [];
      }
    },
    evaluateSelectedKeys: function (values, key) {
      var selectedKeys = [];
      for (var i = values.length; i--; ) {
        var value = values[i];
        selectedKeys.push(value[key]);
      }
      return selectedKeys;
    },
    getParamsFiltered: async function (filters = {}) {
      try {
        this.setParamsLoading(true);

        var params = await this.api('/params/filtered').post({
          abtei: filters.abtei,
          verak: filters.verak,
        });

        return params;
      } catch (error) {
        throw error;
      } finally {
        this.setParamsLoading(false);
      }
    },
    getParams: async function () {
      try {
        this.setParamsLoading(true);

        var params = await this.api('/params').get();

        var abtei = params.abtei,
          verak = params.verak,
          kostl = params.kostl;

        var size = Math.max(abtei.length, verak.length, kostl.length);
        this.model.setSizeLimit(size);

        this.setProperty('/abtei/data', abtei);
        this.setProperty('/verak/data', verak);
        this.setProperty('/kostl/data', kostl);

        var selectedKeys = {};
        Object.keys(params).forEach(
          function (key) {
            var param = params[key];
            if (!selectedKeys[key]) selectedKeys[key] = [];
            for (var i = param.length; i--; ) {
              var value = param[i];
              selectedKeys[key].push(value[String(key).toUpperCase()]);
            }

            this.setProperty('/' + key + '/selectedKeys', selectedKeys[key]);
          }.bind(this)
        );

        return selectedKeys;
      } catch (error) {
        throw error;
      } finally {
        this.setParamsLoading(false);
      }
    },
  });

  return new ReporteService();
});
