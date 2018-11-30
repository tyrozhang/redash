const ColorBox = {
  bindings: {
    color: '<',
  },
  template: "<span style='width: 12px; height: 12px; background-color: {{$ctrl.color}}; display: inline-block; margin-right: 5px;'></span>",
};

export default function init(ngModule) {
  ngModule.component('colorBox', ColorBox);
}

init.init = true;
