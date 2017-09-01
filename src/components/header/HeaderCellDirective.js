import HeaderCellController from './HeaderCellController';
import HeaderCellTemplate from './HeaderCellDirective.html';

export default function HeaderCellDirective($compile) {
  return {
    restrict: 'E',
    controller: HeaderCellController,
    controllerAs: 'hcell',
    scope: true,
    bindToController: {
      options: '=',
      column: '=',
      onSort: '&',
      sortType: '=',
      onResize: '&',
      selected: '=',
    },
    replace: true,
    template: HeaderCellTemplate,
    compile() {
      return {
        pre($scope, $elm, $attrs, ctrl) {
          const label = $elm[0].querySelector('.dt-header-cell-label');

          let cellScope;

          if (ctrl.column.headerTemplate || ctrl.column.headerRenderer) {
            cellScope = ctrl.options.$outer.$new(false);

            // copy some props
            cellScope.$header = ctrl.column.name;
            cellScope.$index = $scope.$index;
          }

          if (ctrl.column.headerTemplate) {
            const elm = angular.element(`<span>${ctrl.column.headerTemplate.trim()}</span>`);
            angular.element(label).append($compile(elm)(cellScope));
          } else if (ctrl.column.headerRenderer) {
            const elm = angular.element(ctrl.column.headerRenderer($elm));
            angular.element(label).append($compile(elm)(cellScope)[0]);
          } else {
            let val = ctrl.column.name;
            if (angular.isUndefined(val) || val === null) val = '';
            label.textContent = val;
          }
        },
      };
    },
  };
}
