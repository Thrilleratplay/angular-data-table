import BodyController from './BodyController';
import BodyDirectiveTemplate from './BodyDirective.html';

export default function BodyDirective() {
  return {
    restrict: 'E',
    controller: BodyController,
    controllerAs: 'body',
    bindToController: {
      columns: '=',
      columnWidths: '=',
      rows: '=',
      options: '=',
      selected: '=?',
      expanded: '=?',
      onPage: '&',
      onTreeToggle: '&',
      onSelect: '&',
      onRowClick: '&',
      onRowDblClick: '&',
    },
    scope: true,
    template: BodyDirectiveTemplate,
  };
}
