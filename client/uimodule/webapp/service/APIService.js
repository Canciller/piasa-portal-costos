sap.ui.define(['sap/ui/base/Object'], function (BaseObject) {
  'use strict';

  return BaseObject.extend('com.piasa.Costos.CoreService', {
    constructor: function () {},
    setBaseUrl: function (base) {
      this.base = base;
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
          .then((res) => res.json())
          .then((json) => {
            if (json.error) throw json.error;
            return json;
          })
          .catch((error) => {
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
