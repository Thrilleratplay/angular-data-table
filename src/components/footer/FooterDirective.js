import FooterController from './FooterController';
import FooterDirectiveTemplate from './FooterDirective.html';

export default function FooterDirective() {
  return {
    restrict: 'E',
    controller: FooterController,
    controllerAs: 'footer',
    scope: true,
    bindToController: {
      paging: '=',
      onPage: '&',
    },
    template: FooterDirectiveTemplate,
    replace: true,
  };
}
