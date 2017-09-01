import PagerController from './PagerController';
import PagerDirectiveTemplate from './PagerDirective.html';

export default function PagerDirective() {
  return {
    restrict: 'E',
    controller: PagerController,
    controllerAs: 'pager',
    scope: true,
    bindToController: {
      page: '=',
      size: '=',
      count: '=',
      onPage: '&',
    },
    template: PagerDirectiveTemplate,
    replace: true,
  };
}
