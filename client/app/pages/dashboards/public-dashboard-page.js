import * as _ from 'lodash';
import logoUrl from '@/assets/images/redash_icon_small.png';
import template from './public-dashboard-page.html';
import './dashboard.less';

const PublicDashboardPage = {
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
          this.extractGlobalParameters();
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

    this.globalParameters = [];
    const refreshRate = Math.max(30, parseFloat($location.search().refresh));

    this.extractGlobalParameters = () => {
      this.globalParameters = Dashboard.getGlobalParams(this.dashboard.widgets);
    };

    this.onGlobalParametersChange = () => {
      this.globalParameters.forEach((global) => {
        global.locals.forEach((local) => {
          local.value = global.value;
        });
      });
    };

    this.refreshDashboard = () => {
      this.loadDashboard().then(() => {
        this.extractGlobalParameters();
      });
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
  ngModule.component('publicDashboardPage', PublicDashboardPage);

  function session($http, $route, Auth) {
    const token = $route.current.params.token;
    Auth.setApiKey(token);
    return Auth.loadConfig();
  }

  ngModule.config(($routeProvider) => {
    $routeProvider.when('/public/dashboards/:token', {
      template: '<public-dashboard-page dashboard="$resolve.dashboard"></public-dashboard-page>',
      reloadOnSearch: false,
      resolve: {
        session,
      },
    });
  });

  return [];
}

init.init = true;

