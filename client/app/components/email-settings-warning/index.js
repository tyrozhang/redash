function controller(clientConfig, currentUser) {
  this.showMailWarning = clientConfig.mailSettingsMissing && currentUser.isAdmin;
}

export default function init(ngModule) {
  ngModule.component('emailSettingsWarning', {
    bindings: {
      function: '<',
    },
    template:
      '<p class="alert alert-danger" ng-if="$ctrl.showMailWarning">{{ "It looks like your mail server isn\'t configured. Make sure to configure it for the" | translate }} {{$ctrl.function}}{{ "to work" | translate}}.</p>',
    controller,
  });
}

init.init = true;
