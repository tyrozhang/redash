import template from './large-screen-page-header.html';

function controller() {

}

export default function init(ngModule) {
  ngModule.component('largeScreenPageHeader', {
    template,
    controller,
    transclude: true,
    bindings: {
      title: '@',
    },
  });
}
