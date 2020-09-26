sap.ui.define(['sap/ui/base/Object'], function (BaseObject) {
  'use strict';

  var alias = '/gastos';

  return BaseObject.extend('com.piasa.Costos.CoreService', {
    constructor: function () {},
    setBaseUrl: function (base) {
      this.base = alias + base;
    },
    setModel: function (model) {
      this.model = model;
    },
    getModel: function () {
      return this.model;
    },
    setProperty: function (property, value) {
      if (this.model) this.model.setProperty(property, value);
    },
    getProperty: function (property, defaultValue) {
      if (this.model) {
        var value = this.model.getProperty(property);
        if (
          (value === undefined || value === null) &&
          (defaultValue !== undefined || defaultValue !== null)
        ) {
          this.setProperty(property, defaultValue);
          return this.model.getProperty(property);
        } else {
          return value;
        }
      }
      return null;
    },
    setLoading: function (loading, property) {
      if (property) this.setProperty(property + '/loading', loading);
      else this.setProperty('/loading', loading);
    },
    setModelSize: function (size) {
      if (this.model) this.model.setSizeLimit(size);
    },
    refresh: function () {
      if (this.model) this.model.refresh();
    },
    api: function (endpoint) {
      var base = this.base;

      var http = function (method, endpoint, data, options) {
        var op = {};
        if (options) op = options;

        op.body = JSON.stringify(data);
        op.method = method;
        if (method === 'POST' || method === 'PUT') {
          op.headers = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          };
        }

        var url = base;
        if (endpoint) url += endpoint;

        return fetch(url, op)
          .then((res) => {
            if (res.status === 413)
              throw new Error(
                'El carga es muy pesada para el servidor, contacte a un Administrador.'
              );
            return res.json();
          })
          .then((json) => {
            if (json.error) throw json.error;
            return json;
          })
          .catch((error) => {
            if (error.name === 'SyntaxError')
              throw new Error(
                'Error con el servidor, contacte a un Administrador.'
              );
            console.error(error);
            throw error;
          });
      };

      return {
        get: function (options) {
          return http('GET', endpoint, undefined, options);
        },
        post: function (data, options) {
          return http('POST', endpoint, data, options);
        },
        put: function (data, options) {
          return http('PUT', endpoint, data, options);
        },
        delete: function (options) {
          return http('DELETE', endpoint, undefined, options);
        },
      };
    },
  });
});
