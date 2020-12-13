sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/ReporteBase.controller',
    'sap/ui/export/SpreadSheet',
    '../../../service/AssignmentService',
    '../../../service/Reporte2Service',
  ],
  function (
    ReporteController,
    SpreadSheet,
    AssignmentService,
    Reporte2Service
  ) {
    'use strict';

    return ReporteController.extend(
      'com.piasa.Costos.route.manager.Reporte1.controller',
      {
        onInit: function () {
          this.getRouter()
            .getRoute('reporte_2')
            .attachMatched(async function () {
              await this.onDisplay();
            }, this);

          this.setService(Reporte2Service);
          ReporteController.prototype.onInit.call(this);

          AssignmentService.attachOnSave(
            function () {
              this.disableAll();
            }.bind(this)
          );

          this.setupExport();
          this.attachOnReady(
            async function () {
              if (this.isLoading()) Reporte2Service.abort();
              else {
                await Reporte2Service.fillReporte();

                var reporte = Reporte2Service.getProperty('/data');

                var data = [];

                var size = reporte.length;
                if (size > 0) {
                  var currDataIndex = 0;
                  var currInnerDataIndex = 0;

                  var DESC2 = null,
                    DESC1 = null;

                  var currData = null;
                  var currInnerData = null;
                  for (var i = 0; i < size; i++) {
                    var line = reporte[i];

                    if (DESC2 !== line.DESC2 || !currData) {
                      DESC2 = line.DESC2;

                      data.push({
                        DESC1_: DESC2,
                        data: [],
                      });

                      currData = data[currDataIndex].data;
                      currDataIndex++;
                      currInnerDataIndex = 0;
                    }

                    if (!line.DESC1 || line.DESC1.length === 0) {
                      currData.push(line);
                      currInnerDataIndex++;
                    } else {
                      if (DESC1 !== line.DESC1 || !currInnerData) {
                        DESC1 = line.DESC1;
                        currData.push({
                          DESC1_: line.DESC1_,
                          data: [],
                        });

                        currInnerData = currData[currInnerDataIndex].data;
                        currInnerDataIndex++;
                      }

                      currInnerData.push(line);
                    }
                  }
                }

                Reporte2Service.setProperty('/tree', { data: data });
              }
            }.bind(this)
          );
          this.attachOnExport(this.handleExport.bind(this));
        },
        setupExport: function () {
          var aColumns = [
            {
              label: 'Tipo de Gasto',
              property: 'DESC2',
            },
            {
              label: 'Cuenta Monthly Package Manual',
              property: 'DESC1_',
            },
            {
              label: 'Descripción',
              property: 'TXT50',
            },
            {
              label: 'Año',
              property: 'GJAHR',
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
            {
              label: 'Total',
              property: 'TOTAL',
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
          var data = Reporte2Service.getProperty('/data'),
            date = Reporte2Service.getDate();

          var year = date.year;

          var name = `Tendencias de costos ${year}`;
          this._mSettings.fileName = name + '.xlsx';
          this._mSettings.dataSource = data;
          this._mSettings.workbook.context = {
            sheetName: `${year}`,
          };
          var oSpreadsheet = new SpreadSheet(this._mSettings);
          oSpreadsheet.build();
        },
      }
    );
  }
);
