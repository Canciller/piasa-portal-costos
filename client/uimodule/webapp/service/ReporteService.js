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
            loading: true,
            data: [],
          },
          reporte2: {
            loading: true,
            data: [],
          },
          kostl: {
            loading: true,
            data: [],
          },
        })
      );
    },
    getReporte1: function (year, month, kostl) {
      console.log(year, month, kostl);
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
