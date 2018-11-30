// import settingsMenu from '@/lib/settings-menu';
import template from './organization.html';

function OrganizationSettingsCtrl($http, toastr, clientConfig, Events) {
  Events.record('view', 'page', 'org_settings');

  this.settings = {};
  $http.get('api/settings/organization').then((response) => {
    this.settings = response.data.settings;
  });

  this.update = (key) => {
    $http.post('api/settings/organization', { [key]: this.settings[key] }).then((response) => {
      this.settings = response.data.settings;
      toastr.success('设置修改已保存.');

      if (this.disablePasswordLoginToggle() && this.settings.auth_password_login_enabled === false) {
        this.settings.auth_password_login_enabled = true;
        this.update('auth_password_login_enabled');
      }
    }).catch(() => {
      toastr.error('设置修改失败.');
    });
  };

  this.dateFormatList = clientConfig.dateFormatList;
  this.googleLoginEnabled = clientConfig.googleLoginEnabled;

  this.disablePasswordLoginToggle = () =>
    (clientConfig.googleLoginEnabled || this.settings.auth_saml_enabled) === false;
}

export default function init(ngModule) {
  /**
   settingsMenu.add({
    permission: 'admin',
    title: '设置',
    path: 'settings/organization',
    order: 6,
  });
   */

  ngModule.component('organizationSettingsPage', {
    template,
    controller: OrganizationSettingsCtrl,
  });

  return {
    '/settings/organization': {
      template: '<organization-settings-page></organization-settings-page>',
      title: '设置',
    },
  };
}

init.init = true;

