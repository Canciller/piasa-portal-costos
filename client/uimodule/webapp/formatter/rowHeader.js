sap.ui.define([], function () {
  'use strict';

  return function (value) {
    this.removeStyleClass('rowHeader');

    if (!value) return value;

    const includes = ['Gastos de Personal', 'Gastos Generales'].includes(
      value.trim()
    );

    if (includes) this.addStyleClass('rowHeader');

    return value;
  };
});
