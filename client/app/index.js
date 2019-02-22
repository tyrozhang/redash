import ngModule from '@/config';
import zh from '@/i18n/zh';

ngModule.config(($locationProvider, $compileProvider, uiSelectConfig, toastrConfig, $translateProvider) => {
  $compileProvider.debugInfoEnabled(false);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data|tel|sms|mailto):/);
  $locationProvider.html5Mode(true);
  uiSelectConfig.theme = 'bootstrap';

  $translateProvider.translations('zh', zh);
  $translateProvider.preferredLanguage('zh');

  Object.assign(toastrConfig, {
    positionClass: 'toast-bottom-right',
    timeOut: 2000,
  });
});

// Update ui-select's template to use Font-Awesome instead of glyphicon.
ngModule.run(($templateCache) => {
  const templateName = 'bootstrap/match.tpl.html';
  let template = $templateCache.get(templateName);
  template = template.replace('glyphicon glyphicon-remove', 'fa fa-remove');
  $templateCache.put(templateName, template);
});

export default ngModule;
