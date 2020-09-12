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
      'com.piasa.Costos.route.manager.Reporte1DetailBudget.controller',
      {
        onInit: function () {
          this.getRouter()
            .getRoute('reporte1_presupuesto')
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

                var desc1 = Reporte1Service.getDESC1(),
                  desc2 = Reporte1Service.getDESC2();
                Reporte1DetailService.setDESC1(desc1);
                Reporte1DetailService.setDESC2(desc2);

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
          this.attachOnReady(async function() {
            if(this.isLoading()) Reporte1DetailService.abort();
            else Reporte1DetailService.fillReporteDetail();
          }.bind(this));
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
              label: 'Tipo de Gasto',
              property: 'DESC2',
            },
            {
              label: 'Cuenta Monthly Package Manual',
              property: 'DESC1_',
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
          ];

          this._mSettings = {
            workbook: {
              columns: aColumns,
            },
          };
        },
        handleExport: async function () {
          var data = Reporte1DetailService.getProperty('/detail/data'),
            desc1 = Reporte1DetailService.getDESC1_(),
            desc2 = Reporte1DetailService.getDESC2();

          var date = Reporte1DetailService.getDate();
          var year = date.year,
            month = date.month;

          this._mSettings.fileName = `${desc2} - ${desc1} Presupuesto ${year} ${month}`;
          this._mSettings.dataSource = data;
          this._mSettings.workbook.context = {
            sheetName: `${desc1} ${year} ${month}`,
          };
          var oSpreadsheet = new SpreadSheet(this._mSettings);
          oSpreadsheet.build();
        },
      }
    );
  }
);
