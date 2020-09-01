sap.ui.define(['./APIService', 'sap/ui/model/json/JSONModel'], function (
  APIService,
  JSONModel
) {
  'use strict';

  var ReporteService = APIService.extend('com.piasa.Costos.ReporteService', {
    constructor: function () {
      this.setBaseUrl('/api/v1/reportes');
      this.setModel(
        new JSONModel({
          reporte1: {
            data: [],
          },
          reporte1Detail: {
            data: [],
          },
          reporte2: {
            data: [],
          },
          kostl: {
            data: [],
          },
        })
      );
    },
    isReporte1Empty: function () {
      var reporte1 = this.getProperty('/reporte1/data');
      if (!(reporte1 instanceof Array)) return true;
      return reporte1.length === 0;
    },
    isReporte1DetailEmpty: function () {
      var reporte1 = this.getProperty('/reporte1Detail/data');
      if (!(reporte1 instanceof Array)) return true;
      return reporte1.length === 0;
    },
    setReporte1DetailPath: function (path) {
      this.setProperty('/reporte1Detail/path', path);
    },
    getReporte1Detail: async function () {
      try {
        this.setProperty('/reporte1Detail/loading', true);
        var path = this.getProperty('/reporte1Detail/path'),
          hkont = this.getProperty(path + '/HKONT'),
          kostl = this.getProperty('/reporte1Detail/kostl'),
          year = this.getProperty('/reporte1Detail/year'),
          month = this.getProperty('/reporte1Detail/month');

        var detail = await this.api('/1/detail').post({
          kostl: kostl,
          hkont: hkont,
          year: year,
          month: month,
        });

        this.setProperty('/reporte1Detail/hkont', hkont);
        this.setProperty('/reporte1Detail/data', detail);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/reporte1Detail/loading', false);
      }
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

        var reporte1 = await this.api('/1').post({
          year: year,
          month: month,
          kostl: kostl,
        });

        this.setProperty('/reporte1/data', reporte1);
        this.setProperty('/reporte1/empty', reporte1.length === 0);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/reporte1/loading', false);
      }
    },
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
    getKOSTLSelectedKeys: function () {
      return this.getProperty('/kostl/selectedKeys');
    },
    getStoredKOSTL: function () {
      return this.getProperty('/kostl/data');
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
  });

  return new ReporteService();
});
