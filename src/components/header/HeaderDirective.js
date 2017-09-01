import HeaderController from './HeaderController';
import HeaderDirectiveTemplate from './HeaderDirective.html';

export default function HeaderDirective($timeout) {
  return {
    restrict: 'E',
    controller: HeaderController,
    controllerAs: 'header',
    scope: true,
    bindToController: {
      options: '=',
      columns: '=',
      columnWidths: '=',
      selectedRows: '=?',
      allRows: '=',
      onSort: '&',
      onResize: '&',
    },
    template: HeaderDirectiveTemplate,
    replace: true,
    link($scope, $elm, $attrs, ctrl) {
      $scope.columnsResorted = function columnsResorted(event, columnId) {
        const col = findColumnById(columnId);
        const parent = angular.element(event.currentTarget);

        let newIdx = -1;

        angular.forEach(parent.children(), (c, i) => {
          if (columnId === angular.element(c).attr('data-id')) {
            newIdx = i;
          }
        });

        $timeout(() => {
          angular.forEach(ctrl.columns, (group) => {
            const idx = group.indexOf(col);
            if (idx > -1) {
              // this is tricky because we want to update the index
              // in the orig columns array instead of the grouped one
              const curColAtIdx = group[newIdx];
              const siblingIdx = ctrl.options.columns.indexOf(curColAtIdx);
              const curIdx = ctrl.options.columns.indexOf(col);

              ctrl.options.columns.splice(curIdx, 1);
              ctrl.options.columns.splice(siblingIdx, 0, col);

              return false;
            }

            return undefined;
          });
        });
      };

      let findColumnById = function findColumnById(columnId) {
        const columns = ctrl.columns.left.concat(ctrl.columns.center).concat(ctrl.columns.right);
        return columns.find(c => c.$id === columnId);
      };
    },
  };
}
