import * as _ from 'lodash';
import logoUrl from '@/assets/images/redash_icon_small.png';
import template from './large-screen-dashboards-page.html';
import './dashboard.less';

const LargeScreenDashboardsPage = {
  template,
  controller($timeout, $location, $http, $route, $q, dashboardGridOptions, Dashboard) {
    'ngInject';

    this.loadDashboard = () => {
      const token = $route.current.params.token;
      $http.get(`api/dashboards/public/${token}`).then((response) => {
        const dashboard = response.data;
        dashboard.widgets = Dashboard.prepareDashboardWidgets(dashboard.widgets);

        const queryResultPromises = _.compact(dashboard.widgets.map(widget => widget.load(true)));
        $q.all(queryResultPromises).then(() => {
          this.dashboard = dashboard;
        });
      });
    };

    this.loadDashboard();

    this.dashboardGridOptions = Object.assign({}, dashboardGridOptions, {
      resizable: { enabled: false },
      draggable: { enabled: false },
    });

    this.logoUrl = logoUrl;
    this.public = true;

    const refreshRate = Math.max(30, parseFloat($location.search().refresh));

    this.refreshDashboard = () => {
      this.loadDashboard();
    };

    if (refreshRate) {
      const refresh = () => {
        this.refreshDashboard();
        $timeout(refresh, refreshRate * 1000.0);
      };
      $timeout(refresh, refreshRate * 1000.0);
    }
  },
};

export default function init(ngModule) {
  ngModule.component('largeScreenDashboardsPage', LargeScreenDashboardsPage);

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
        session,
      },
    });
  });

  return [];
}

init.init = true;
