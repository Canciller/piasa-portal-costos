sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/Reporte.controller',
    'sap/m/MessageBox',
    '../../../service/AssignmentService',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    MessageBox,
    AssignmentService,
    ReporteService,
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

                    return ReporteService.getReporte1({
                      year: date.year,
                      month: date.month,
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

          AssignmentService.attachOnSave(function() {
            this._loaded = false;
          }.bind(this))

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
