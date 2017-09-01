import GroupRowController from './GroupRowController';
import TranslateXY from '../../utils/translate';
import GroupRowDirectiveTemplate from './GroupRowDirective.html';

export default function GroupRowDirective() {
  return {
    restrict: 'E',
    controller: GroupRowController,
    controllerAs: 'group',
    bindToController: {
      row: '=',
      onGroupToggle: '&',
      expanded: '=',
      options: '=',
    },
    scope: true,
    replace: true,
    template: GroupRowDirectiveTemplate,
    link($scope, $elm, $attrs, ctrl) {
      // inital render position
      TranslateXY($elm[0].style, 0, ctrl.row.$$index * ctrl.options.rowHeight);

      // register w/ the style translator
      ctrl.options.internal.styleTranslator.register($scope.$index, $elm);
    },
  };
}
