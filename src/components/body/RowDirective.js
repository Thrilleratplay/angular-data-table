import RowController from './RowController';
import TranslateXY from '../../utils/translate';
import RowDirectiveTemplate from './RowDirective.html'

export default function RowDirective() {
  return {
    restrict: 'E',
    controller: RowController,
    controllerAs: 'rowCtrl',
    scope: true,
    bindToController: {
      row: '=',
      columns: '=',
      columnWidths: '=',
      expanded: '=',
      selected: '=',
      hasChildren: '=',
      options: '=',
      onCheckboxChange: '&',
      onTreeToggle: '&',
    },
    link($scope, $elm, $attrs, ctrl) {
      if (ctrl.row) {
        // inital render position
        TranslateXY($elm[0].style, 0, ctrl.row.$$index * ctrl.options.rowHeight);
      }

      // register w/ the style translator
      ctrl.options.internal.styleTranslator.register($scope.$index, $elm);
    },
    template: RowDirectiveTemplate,
    replace: true,
  };
}
