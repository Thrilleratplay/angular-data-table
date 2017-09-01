import DataTableController from './DataTableController';
import { ScrollbarWidth, ObjectId } from '../utils/utils';
import { throttle } from '../utils/throttle';
import DataTableService from './DataTableService';
import DataTableDirectiveTemplate from './DataTableDirective.html';

export default function DataTableDirective($window, $timeout, $parse) {
  return {
    restrict: 'E',
    replace: true,
    controller: DataTableController,
    scope: true,
    bindToController: {
      options: '=',
      rows: '=',
      selected: '=?',
      expanded: '=?',
      onSelect: '&',
      onSort: '&',
      onTreeToggle: '&',
      onPage: '&',
      onRowClick: '&',
      onRowDblClick: '&',
      onColumnResize: '&',
    },
    controllerAs: 'dt',
    template(element) {
      // Gets the column nodes to transposes to column objects
      // http://stackoverflow.com/questions/30845397/angular-expressive-directive-design/30847609#30847609
      const columns = element[0].getElementsByTagName('column');
      const id = ObjectId();

      DataTableService.saveColumns(id, columns);

      return DataTableDirectiveTemplate;
    },
    compile() {
      return {
        pre($scope, $elm, $attrs, ctrl) {
          DataTableService.buildColumns($scope, $parse);

          // Check and see if we had expressive columns
          // and if so, lets use those
          const id = $elm.attr('data-column-id');
          const columns = DataTableService.columns[id];

          if (columns) {
            ctrl.options.columns = columns;
          }

          ctrl.inheritColumnSortableProps();
          ctrl.transposeColumnDefaults();
          ctrl.options.internal.scrollBarWidth = ScrollbarWidth();

          /**
           * Invoked on init of control or when the window is resized;
           */
          function resize() {
            const rect = $elm[0].getBoundingClientRect();

            ctrl.options.internal.innerWidth = Math.floor(rect.width);

            if (ctrl.options.scrollbarV) {
              let height = rect.height;

              if (ctrl.options.headerHeight) {
                height -= ctrl.options.headerHeight;
              }

              if (ctrl.options.footerHeight) {
                height -= ctrl.options.footerHeight;
              }

              ctrl.options.internal.bodyHeight = height;
              ctrl.calculatePageSize();
            }

            ctrl.adjustColumns();
          }

          function calculateResize() {
            throttle(() => {
              $timeout(resize);
            });
          }

          $window.addEventListener('resize', calculateResize);

          // When an item is hidden for example
          // in a tab with display none, the height
          // is not calculated correrctly.  We need to watch
          // the visible attribute and resize if this occurs
          const checkVisibility = () => {
            const bounds = $elm[0].getBoundingClientRect();
            const visible = bounds.width && bounds.height;

            if (visible) {
              resize();
            } else {
              $timeout(checkVisibility, 100);
            }
          };

          checkVisibility();

          // add a loaded class to avoid flickering
          $elm.addClass('dt-loaded');

          // prevent memory leaks
          $scope.$on('$destroy', () => {
            angular.element($window).off('resize');
          });
        },
      };
    },
  };
}
