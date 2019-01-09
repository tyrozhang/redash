import template from './large-screen-dashboards-page.html';
import './dashboard.less';

function loadDashboard($http, $route) {
  const token = $route.current.params.token;
  return $http.get(`api/dashboards/public/${token}`).then(response => response.data);
}

const LargeScreenDashboardsPage = {
  template,
  bindings: {
    dashboard: '<',
  },
  controller(Dashboard) {
    'ngInject';

    this.public = true;
    this.dashboard.widgets = Dashboard.prepareDashboardWidgets(this.dashboard.widgets);
  },
};

export default function init(ngModule) {
  ngModule.component('largeScreenDashboardsPage', LargeScreenDashboardsPage);

  function loadLargeScreenDashboard($http, $route) {
    'ngInject';

    return loadDashboard($http, $route);
  }

  function session($http, $route, Auth) {
    const token = $route.current.params.token;
    Auth.setApiKey(token);
    return Auth.loadConfig();
  }

  ngModule.config(($routeProvider) => {
    $routeProvider.when('/large_screen/dashboards/:token', {
      template: '<large-screen-dashboards-page dashboard="$resolve.dashboard"></large-screen-dashboards-page>',
      reloadOnSearch: false,
      resolve: {
        dashboard: loadLargeScreenDashboard,
        session,
      },
    });
  });

  return [];
}

init.init = true;
