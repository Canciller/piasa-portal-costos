sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/Reporte.controller',
    'sap/ui/export/SpreadSheet',
    'sap/m/MessageBox',
    '../../../service/AssignmentService',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    SpreadSheet,
    MessageBox,
    AssignmentService,
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
              ReporteService.setProperty('/reporte1Detail/data', []);

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

                    var fromDetail = ReporteService.getProperty(
                      '/reporte1/fromDetail'
                    );
                    if (!fromDetail)
                      return ReporteService.getReporte1({
                        year: date.year,
                        month: date.month,
                        kostl: kostl,
                      });
                    ReporteService.setProperty('/reporte1/fromDetail', false);
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

          AssignmentService.attachOnSave(
            function () {
              this._loaded = false;
            }.bind(this)
          );

          this.setupTableCellClick();
          this.setupExport();
          this.attachOnReady(ReporteService.getReporte1.bind(ReporteService));
          this.attachOnExport(this.handleExport.bind(this));
        },
        setupExport: function () {
          var aColumns = [
            {
              label: 'Cuenta',
              property: 'HKONT',
              type: 'Number',
            },
            {
              label: 'Descripción',
              property: 'TXT50',
            },
            {
              label: 'Real',
              property: 'Actual',
              type: 'Number',
            },
            {
              label: 'Presupuesto',
              property: 'Budget',
              type: 'Number',
            },
            {
              label: 'Actual Acumulado',
              property: 'Actual_Accum',
              type: 'Number',
            },
            {
              label: 'Presupuesto Acumulado',
              property: 'Budget_Accum',
              type: 'Number',
            },
            {
              label: 'Var vs Ppto',
              property: 'Var_vs_Budget',
              type: 'Number',
              scale: 2,
            },
            {
              label: '%',
              property: 'Percentage_1',
              type: 'Number',
              scale: 2,
            },
            {
              label: 'Var vs AA',
              property: 'Var_vs_AA',
              type: 'Number',
              scale: 2,
            },
            {
              label: '%',
              property: 'Percentage_2',
              type: 'Number',
              scale: 2,
            },
          ];

          this._mSettings = {
            workbook: {
              columns: aColumns,
            },
          };
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
              ReporteService.setProperty('/reporte1/loading', true);
              ReporteService.setReporte1DetailPath(path);
              ReporteService.getReporte1Detail()
                .then(() => {
                  ReporteService.setProperty('/reporte1/fromDetail', true);
                  ReporteService.setProperty('/reporte1/loading', false);
                  this.navTo('reporte_1_detail');
                })
                .catch((error) => {
                  ReporteService.setProperty('/reporte1/loading', false);
                  MessageBox.error(error.message);
                });
            }.bind(this)
          );
        },
        onCellClick: function (oEvent) {
          this._selected = oEvent.getParameters();
        },
        handleExport: async function () {
          try {
            ReporteService.setProperty('/exporting', true);
            var data = ReporteService.getProperty('/reporte1/data'),
              year = ReporteService.getProperty('/reporte1Detail/year'),
              month = ReporteService.getProperty('/reporte1Detail/month');

            var name = `costos_sumarizado_${year}_${month}`;
            this._mSettings.fileName = name + '.xlsx';
            this._mSettings.dataSource = data;
            this._mSettings.workbook.context = {
              sheetName: `${year}-${month}`,
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
