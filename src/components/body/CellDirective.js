import CellController from './CellController';
import CellDirectiveTemplate from './CellDirective.html';

export default function CellDirective($rootScope, $compile) {
  return {
    restrict: 'E',
    controller: CellController,
    scope: true,
    controllerAs: 'cell',
    bindToController: {
      options: '=',
      value: '=',
      selected: '=',
      column: '=',
      row: '=',
      expanded: '=',
      hasChildren: '=',
      onTreeToggle: '&',
      onCheckboxChange: '&',
    },
    template: CellDirectiveTemplate,
    replace: true,
    compile() {
      return {
        pre($scope, $elm, $attrs, ctrl) {
          const content = angular.element($elm[0].querySelector('.dt-cell-content'));

          let cellScope;

          // extend the outer scope onto our new cell scope
          if (ctrl.column.template || ctrl.column.cellRenderer) {
            createCellScope();
          }

          $scope.$watch('cell.row', () => {
            if (cellScope) {
              cellScope.$destroy();

              createCellScope();

              cellScope.$cell = ctrl.value;
              cellScope.$row = ctrl.row;
              cellScope.$column = ctrl.column;
              cellScope.$$watchers = null;
            }

            if (ctrl.column.template) {
              content.empty();
              const elm = angular.element(`<span>${ctrl.column.template.trim()}</span>`);
              content.append($compile(elm)(cellScope));
            } else if (ctrl.column.cellRenderer) {
              content.empty();
              const elm = angular.element(ctrl.column.cellRenderer(cellScope, content));
              content.append($compile(elm)(cellScope));
            } else {
              content[0].innerHTML = ctrl.getValue();
            }
          }, true);

          function createCellScope() {
            cellScope = ctrl.options.$outer.$new(false);
            cellScope.getValue = ctrl.getValue;
          }
        },
      };
    },
  };
}
