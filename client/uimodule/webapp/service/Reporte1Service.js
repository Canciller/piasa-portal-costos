sap.ui.define(
  ['./ReporteServiceBase', 'sap/ui/model/json/JSONModel'],
  function (ReporteServiceBase, JSONModel) {
    'use strict';

    var Reporte1Service = ReporteServiceBase.extend(
      'com.piasa.Costos.Reporte1Service',
      {
        constructor: function () {
          ReporteServiceBase.prototype.constructor.call(this);
          this.setReporteUrl('/1');
        },
      }
    );

    return new Reporte1Service();
  }
);
