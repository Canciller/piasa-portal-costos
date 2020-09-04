sap.ui.define(
  [
    'com/piasa/Costos/controller/BaseController',
    'com/piasa/Costos/controller/layout/ToolHeader.controller',
    'sap/ui/export/SpreadSheet',
    '../../../service/ReporteService',
  ],
  function (
    BaseController,
    ToolHeader,
    SpreadSheet,
    ReporteService
  ) {
    'use strict';

    return BaseController.extend(
      'com.piasa.Costos.route.manager.Reporte1DetailReal.controller',
      {
        Header: new ToolHeader(this),
        onInit: function () {
          this.getRouter()
            .getRoute('reporte1_real')
            .attachMatched(function () {
              if (ReporteService.isReporte1Empty()) this.navTo('launchpad');
            }, this);

          this.setupExport();
        },
        setupExport: function () {
          var aColumns = [
            {
              label: 'Centro de costo',
              property: 'KOSTL',
              type: 'Number',
            },
            {
              label: 'Descripción',
              property: 'LTEXT',
            },
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
              label: 'Cuenta Monthly Package Manual',
              property: 'DESC1',
            },
            {
              label: 'Tipo de Gasto',
              property: 'DESC2',
            },
            {
              label: 'Año',
              property: 'GJAHR',
              type: 'Number',
            },
            {
              label: 'Mes',
              property: 'MONAT',
              type: 'Number',
            },
            {
              label: 'Valor',
              property: 'DMBTR',
              type: 'Number',
            },
            {
              label: 'Num.Documento',
              property: 'BELNR',
              type: 'Number',
            },
            {
              label: 'Sociedad FI',
              property: 'BUKRS',
              type: 'Number',
            },
            {
              label: 'Pos.Doc.',
              property: 'BUZEI',
              type: 'Number',
            },
            {
              label: 'Fecha cont.',
              property: 'BUDAT',
            },
            {
              label: 'Usuario',
              property: 'USNAM',
            },
            {
              label: 'Proveedor',
              property: 'LIFNR',
              type: 'Number',
            },
            {
              label: 'Pedido',
              property: 'EBELN',
            },
            {
              label: 'Pos.Ped.',
              property: 'EBELP',
              type: 'Number',
            },
            {
              label: 'Texto',
              property: 'SGTXT',
            },
          ];

          this._mSettings = {
            workbook: {
              columns: aColumns,
            },
          };
        },
        onExport: async function () {
          try {
            ReporteService.setProperty('/exporting', true);
            var data = ReporteService.getProperty('/reporte1Detail/data'),
              year = ReporteService.getProperty('/reporte1Detail/selectedYear'),
              month = ReporteService.getProperty('/reporte1Detail/month'),
              desc1 = ReporteService.getProperty('/reporte1Detail/desc1');

            this._mSettings.fileName = `${desc1}_${year}_${month}`;
            this._mSettings.dataSource = data;
            this._mSettings.workbook.context = {
              sheetName: `${desc1}-${year}-${month}`,
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
