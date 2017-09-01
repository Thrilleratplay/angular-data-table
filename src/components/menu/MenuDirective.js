import MenuDirectiveTemplate from './MenuDirective.html';

export default function MenuDirective() {
  return {
    restrict: 'E',
    controller: 'MenuController',
    controllerAs: 'dtm',
    scope: {
      current: '=',
      available: '=',
    },
    template: MenuDirectiveTemplate,
  };
}
