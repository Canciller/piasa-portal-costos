sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/Reporte.controller',
    'sap/ui/export/SpreadSheet',
    'sap/m/MessageBox',
    'sap/m/MessageToast',
    '../../../service/AssignmentService',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    SpreadSheet,
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
              /*
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
                */
            }, this);

          BaseController.prototype.onInit.call(this);

          this.attachOnReady(ReporteService.getReporte2.bind(ReporteService));
          AssignmentService.attachOnSave(
            function () {
              this.setLoaded(false);
            }.bind(this)
          );
          this.attachOnExport(this.handleExport.bind(this));
          this.setupExport();
        },
        setupExport: function () {
          var aColumns = [
            {
              label: 'Descripción',
              property: 'TXT50',
            },
            {
              label: 'Año',
              property: 'YEAR',
              type: 'Number',
            },
            {
              label: 'Enero',
              property: 'P01',
              type: 'Number',
            },
            {
              label: 'Febrero',
              property: 'P02',
              type: 'Number',
            },
            {
              label: 'Marzo',
              property: 'P03',
              type: 'Number',
            },
            {
              label: 'Abril',
              property: 'P04',
              type: 'Number',
            },
            {
              label: 'Mayo',
              property: 'P05',
              type: 'Number',
            },
            {
              label: 'Junio',
              property: 'P06',
              type: 'Number',
            },
            {
              label: 'Julio',
              property: 'P07',
              type: 'Number',
            },
            {
              label: 'Agosto',
              property: 'P08',
              type: 'Number',
            },
            {
              label: 'Septiembre',
              property: 'P09',
              type: 'Number',
            },
            {
              label: 'Octubre',
              property: 'P10',
              type: 'Number',
            },
            {
              label: 'Noviembre',
              property: 'P11',
              type: 'Number',
            },
            {
              label: 'Diciembre',
              property: 'P12',
              type: 'Number',
            },
          ];

          this._mSettings = {
            workbook: {
              columns: aColumns,
            },
          };
        },
        handleExport: async function () {
          try {
            ReporteService.setProperty('/exporting', true);
            var data = ReporteService.getProperty('/reporte2/data'),
              year = ReporteService.getProperty('/reporte2/year');

            var name = `tendencias_de_costos_${year}`;
            this._mSettings.fileName = name + '.xlsx';
            this._mSettings.dataSource = data;
            this._mSettings.workbook.context = {
              sheetName: `${year}`,
            };
            var oSpreadsheet = new SpreadSheet(this._mSettings);
            oSpreadsheet.build();
          } catch (error) {
            throw error;
          } finally {
            ReporteService.setProperty('/exporting', false);
          }
        },
      }
    );
  }
);
