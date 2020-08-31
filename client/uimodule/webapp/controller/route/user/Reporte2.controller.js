sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/Reporte.controller',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    MessageBox,
    MessageToast,
    ReporteService,
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte2.controller',
      {
        onInit: function () {
          this.getRouter()
            .getRoute('reporte_2')
            .attachMatched(function () {
              ReporteService.getKOSTL()
                .then(
                  function () {
                    if (!this._loaded) {
                      this.resetMultiComboBox();
                      this._selected = undefined;
                    }
                  }.bind(this)
                )
                .then(
                  function () {
                    if (!this._loaded) {
                      var date = this.getCurrentDate();
                      var kostl = ReporteService.getKOSTLSelectedKeys();
                      /*
                      return ReporteService.getReporte1({
                        year: date.year,
                        month: date.month,
                        kostl: kostl,
                      });
                      */
                    }
                  }.bind(this)
                )
                .catch((error) => {
                  MessageBox.error(error.message);
                })
                .finally(
                  function () {
                    if (!this._loaded) this._loaded = true;
                  }.bind(this)
                );
            }, this);

          BaseController.prototype.onInit.call(this);
        },
      }
    );
  }
);
