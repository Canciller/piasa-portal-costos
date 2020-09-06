sap.ui.define(
  ['./ReporteServiceBase', 'sap/ui/model/json/JSONModel'],
  function (ReporteServiceBase, JSONModel) {
    'use strict';

    var Reporte2Service = ReporteServiceBase.extend(
      'com.piasa.Costos.Reporte2Service',
      {
        constructor: function () {
          ReporteServiceBase.prototype.constructor.call(this);
          this.setReporteUrl('/2');
        },
      }
    );

    return new Reporte2Service();
  }
);
