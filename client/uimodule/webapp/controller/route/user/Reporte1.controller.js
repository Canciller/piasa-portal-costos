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
            .attachMatched(async function () {
              ReporteService.setProperty('/reporte1Detail/data', []);

              try {
                var selectedKeys = await ReporteService.getParams();

                this._selected = undefined;

                if(!this.isLoaded() || !ReporteService.isEnabled()) {
                  this.resetMultiComboBox();

                  if(selectedKeys.kostl.length === 0) {
                    throw {
                      type: 'warning',
                      message: 'No tiene ningun centro de costo asignado.',
                    };
                  }
                }

                if(!ReporteService.fromDetail()) {
                  var date = this.getDatePickerDate();
                  var kostl = this.loaded ? this.getSelectedKeys('kostl') : selectedKeys.kostl;

                  await ReporteService.getReporte1({
                    year: date.year,
                    month: date.month,
                    kostl: kostl,
                  });
                }

                ReporteService.setFromDetail(false);
                ReporteService.enable();
                this.setLoaded(true);
              } catch(error) {
                  ReporteService.disable();
                  this.setLoaded(false);

                  if (error.type === 'warning')
                    MessageBox.warning(error.message);
                  else MessageBox.error(error.message);
              } finally {

              }
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
                      if (kostl.length === 0) {
                        ReporteService.setProperty('/enabled', false);
                        throw {
                          type: 'warning',
                          message: 'No tiene ningun centro de costo asignado.',
                        };
                      } else {
                        ReporteService.setProperty('/enabled', true);
                      }
                    }

                    var fromdetail = reporteservice.getproperty(
                      '/reporte1/fromdetail'
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
                */
            }, this);

          BaseController.prototype.onInit.call(this);

          AssignmentService.attachOnSave(
            function () {
              this.setLoaded(false);
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
              label: 'Cuenta Monthly Package Manual',
              property: 'DESC1',
            },
            {
              label: 'Real',
              property: 'Actual_CY',
              type: 'Number',
            },
            {
              label: 'Actual Acumulado',
              property: 'Actual_Accum_CY',
              type: 'Number',
            },
            {
              label: 'Presupuesto',
              property: 'Budget_CY',
              type: 'Number',
            },
            {
              label: 'Presupuesto Acumulado',
              property: 'Budget_Accum_CY',
              type: 'Number',
            },
            {
              label: 'Real AA',
              property: 'Actual_LY',
              type: 'Number',
            },
            {
              label: 'Real Acumulado AA',
              property: 'Actual_Accum_LY',
              type: 'Number',
            },
            {
              label: 'Presupuesto AA',
              property: 'Budget_LY',
              type: 'Number',
            },
            {
              label: 'Presupuesto Acumulado AA',
              property: 'Budget_Accum_LY',
              type: 'Number',
            },
          ];

          this._mSettings = {
            workbook: {
              columns: aColumns,
            },
          };
        },
        setupTableCellClick: function () {
          var oTable = this.byId('table'),
            aColumns = oTable.getColumns();

          oTable.attachBrowserEvent(
            'dblclick',
            async function () {
              var selected = this._selected;
              if (!selected) return;

              var oBindingContext = selected.rowBindingContext;
              if (!oBindingContext) return;

              var columnIndex = parseInt(selected.columnIndex),
                oColumn = aColumns[columnIndex];

              var path = oBindingContext.getPath(),
                key = oColumn.getSortProperty();

              var route = 'reporte1_real';

              var isBudget = false,
                isLastYear = false,
                desc1 = ReporteService.getProperty(path + '/DESC1');

              console.log(key);
              switch (key) {
                case 'Actual_CY':
                  break;
                case 'Budget_CY':
                  route = 'reporte1_presupuesto';
                  isBudget = true;
                  break;
                case 'Actual_LY':
                  isLastYear = true;
                  break;
                case 'Budget_LY':
                  route = 'reporte1_presupuesto';
                  isLastYear = true;
                  isBudget = true;
                  break;
                default:
                  return;
              }

              try {
                ReporteService.setProperty('/reporte1/loading', true);
                var detail = await ReporteService.getReporte1Detail({
                  isBudget: isBudget,
                  isLastYear: isLastYear,
                  desc1: desc1,
                });

                if (detail.length !== 0) {
                  ReporteService.setProperty('/reporte1/fromDetail', true);
                  this.navTo(route);
                }
              } catch (error) {
                MessageBox.error(error.message);
              } finally {
                ReporteService.setProperty('/reporte1/loading', false);
              }
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
