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
    getReporte1Detail: async function () {
      try {
        this.setProperty('/reporte1Detail/loading', true);
        var path = this.getProperty('/reporte1Detail/path'),
          data = this.getProperty(path),
          year = this.getProperty('/reporte1Detail/year'),
          month = this.getProperty('/reporte1Detail/month');

        var detail = await this.api('/1/detail').post({
          kostl: data.KOSTL,
          hkont: data.HKONT,
          year: year,
          month: month,
        });

        this.setProperty('/reporte1Detail/data', detail);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/reporte1Detail/loading', false);
      }
    },
    setReporte1DetailPath: function (path) {
      this.setProperty('/reporte1Detail/path', path);
    },
    getReporte1: async function (year, month, kostl) {
      try {
        this.setProperty('/reporte1Detail/year', year);
        this.setProperty('/reporte1Detail/month', month);
        this.setProperty(
          '/reporte1Detail/date',
          `${year}/${String(month).substr(0, 2).padStart(2, '0')}`
        );
        this.setProperty('/reporte1/loading', true);

        var reporte1 = await this.api('/1').post({
          year: year,
          month: month,
          kostl: kostl,
        });

        this.setProperty('/reporte1/data', reporte1);
      } catch (error) {
        throw error;
      } finally {
        this.setProperty('/reporte1/loading', false);
      }
    },
    getReporte2: function () {},
    setKOSTL: function (kostl) {
      if (!(kostl instanceof Array)) return;
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
