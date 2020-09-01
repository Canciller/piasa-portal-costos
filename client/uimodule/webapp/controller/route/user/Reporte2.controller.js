sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/Reporte.controller',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    '../../../service/AssignmentService',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    MessageBox,
    MessageToast,
    AssignmentService,
    ReporteService
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
                    var enabled = ReporteService.getProperty('/enabled'),
                      loaded = ReporteService.getProperty('/loaded');
                    if (!loaded || !enabled || !this._loaded) {
                      this.resetMultiComboBox();
                      this._selected = undefined;
                    }
                  }.bind(this)
                )
                .then(
                  function () {
                    var enabled = ReporteService.getProperty('/enabled'),
                      loaded = ReporteService.getProperty('/loaded');
                    var date = this.getDatePickerDate(),
                      kostl = ReporteService.getKOSTLSelectedKeys();

                    if (!loaded || !enabled || !this._loaded) {
                      ReporteService.setProperty('/enabled', true);
                      if (kostl.length === 0) {
                        ReporteService.setProperty('/enabled', false);
                        throw {
                          type: 'warning',
                          message: 'No tiene ningun centro de costo asignado.',
                        };
                      }
                    }

                    return ReporteService.getReporte2({
                      year: date.year,
                      kostl: kostl,
                    });
                  }.bind(this)
                )
                .then(
                  function () {
                    ReporteService.setProperty('/loaded', true);
                    this._loaded = true;
                  }.bind(this)
                )
                .catch((error) => {
                  ReporteService.setProperty('/loaded', false);
                  this._loaded = false;

                  if (error.type === 'warning')
                    MessageBox.warning(error.message);
                  else MessageBox.error(error.message);
                });
            }, this);

          BaseController.prototype.onInit.call(this);

          this.attachOnReady(ReporteService.getReporte2.bind(ReporteService));
          AssignmentService.attachOnSave(
            function () {
              this._loaded = false;
            }.bind(this)
          );
        },
      }
    );
  }
);
