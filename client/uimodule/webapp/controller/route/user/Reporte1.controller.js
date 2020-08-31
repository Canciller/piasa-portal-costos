sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/Reporte.controller',
    'sap/m/MessageBox',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    MessageBox,
    ReporteService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte1.controller',
      {
        onInit: function () {
          this.getRouter()
            .getRoute('reporte_1')
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
                      return ReporteService.getReporte1({
                        year: date.year,
                        month: date.month,
                        kostl: kostl,
                      });
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

          this.setupTableCellClick();
          this.attachOnReady(ReporteService.getReporte1.bind(ReporteService));
        },
        setupTableCellClick: function () {
          var oTable = this.byId('table');
          oTable.attachBrowserEvent(
            'dblclick',
            function () {
              var selected = this._selected;
              if (!selected) return;

              var oBindingContext = selected.rowBindingContext;
              if (!oBindingContext) return;

              var path = oBindingContext.getPath();
              ReporteService.setReporte1DetailPath(path);
              ReporteService.getReporte1Detail()
                .then(() => {
                  this.navTo('reporte_1_detail');
                })
                .catch((error) => {
                  MessageBox.error(error.message);
                });
            }.bind(this)
          );
        },
        onCellClick: function (oEvent) {
          this._selected = oEvent.getParameters();
        },
      }
    );
  }
);
