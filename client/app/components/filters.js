import template from './filters.html';

const FiltersComponent = {
  template,
  bindings: {
    onChange: '&',
    filters: '<',
  },
  controller($scope) {
    'ngInject';

    this.filterChangeListener = (filter, modal) => {
      this.onChange({ filter, $modal: modal });
    };

    this.itemGroup = (item) => {
      if (item === '*' || item === '-') {
        return '';
      }

      return 'Values';
    };

    this.onChangeDate = (date, dateString, filterName) => {
      this.filters.forEach((filter) => {
        if (filter.name === filterName) {
          filter.current = date;
        }
      });
      $scope.$apply();
    };
  },
};

export default function init(ngModule) {
  ngModule.component('filters', FiltersComponent);
}

init.init = true;
