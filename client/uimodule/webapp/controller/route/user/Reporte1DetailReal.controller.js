sap.ui.define(
  [
    'com/piasa/Costos/controller/route/user/ReporteBase.controller',
    'sap/ui/export/SpreadSheet',
    '../../../service/AssignmentService',
    '../../../service/Reporte1Service',
    '../../../service/Reporte1DetailService',
  ],
  function (
    ReporteController,
    SpreadSheet,
    AssignmentService,
    Reporte1Service,
    Reporte1DetailService
  ) {
    'use strict';

    return ReporteController.extend(
      'com.piasa.Costos.route.manager.Reporte1DetailReal.controller',
      {
        onInit: function () {
          this.getRouter()
            .getRoute('reporte1_real')
            .attachMatched(async function () {
              //this.clearAll();

              if (!Reporte1Service.fromReporte()) {
                this.navTo('launchpad');
              } else {
                Reporte1Service.setFromReporte(false);
                Reporte1Service.setFromDetail(true);

                Reporte1DetailService.setProperty(
                  '/isBudget',
                  Reporte1Service.getProperty('/isBudget')
                );

                var desc1 = Reporte1Service.getDESC1();
                Reporte1DetailService.setDESC1(desc1);

                var selectedAbtei = Reporte1Service.getSelectedKeys('abtei'),
                  selectedVerak = Reporte1Service.getSelectedKeys('verak'),
                  selectedKostl = Reporte1Service.getSelectedKeys('kostl');

                var abtei = Reporte1Service.getParam('abtei'),
                  verak = Reporte1Service.getParam('verak'),
                  kostl = Reporte1Service.getParam('kostl');

                Reporte1DetailService.setModelSize(
                  Math.max(abtei.length, verak.length, kostl.length)
                );

                Reporte1DetailService.setParam('abtei', abtei);
                Reporte1DetailService.setParam('verak', verak);
                Reporte1DetailService.setParam('kostl', kostl);

                Reporte1DetailService.setSelectedKeys('abtei', selectedAbtei);
                Reporte1DetailService.setSelectedKeys('verak', selectedVerak);
                Reporte1DetailService.setSelectedKeys('kostl', selectedKostl);

                var isLastYear = Reporte1Service.getProperty('/isLastYear');
                var date = isLastYear
                  ? Reporte1Service.getDateLastYearStr()
                  : Reporte1Service.getDateStr();

                Reporte1DetailService.setDate(date);

                this.enable();

                await this.onReady();
              }
            }, this);

          AssignmentService.attachOnSave(
            function () {
              this.disableAll();
            }.bind(this)
          );

          this.setService(Reporte1DetailService);
          this.clearAll();
          ReporteController.prototype.onInit.call(this);

          this.setupExport();
          this.attachOnReady(
            Reporte1DetailService.fillReporteDetail.bind(Reporte1DetailService)
          );
          this.attachOnExport(this.handleExport.bind(this));
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
              type: 'Number',
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
        handleExport: async function () {
          var data = Reporte1DetailService.getProperty('/detail/data'),
            desc1 = Reporte1DetailService.getDESC1();

          var date = Reporte1DetailService.getDate();
          var year = date.year,
            month = date.month;

          this._mSettings.fileName = `${desc1}_${year}_${month}`;
          this._mSettings.dataSource = data;
          this._mSettings.workbook.context = {
            sheetName: `${desc1}-${year}-${month}`,
          };
          var oSpreadsheet = new SpreadSheet(this._mSettings);
          oSpreadsheet.build();
        },
      }
    );
  }
);