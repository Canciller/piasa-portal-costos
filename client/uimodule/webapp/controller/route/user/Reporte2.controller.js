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
              await Reporte2Service.fillReporte();
            }.bind(this)
          );
          this.attachOnExport(this.handleExport.bind(this));
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
          var data = Reporte2Service.getProperty('/data'),
            date = Reporte2Service.getDate();

          var year = date.year;

          var name = `tendencias_de_costos_${year}`;
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
