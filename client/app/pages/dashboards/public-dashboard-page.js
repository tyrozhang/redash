import * as _ from 'lodash';
import template from './public-dashboard-page.html';
import './dashboard.less';

function loadDashboard($http, $route) {
  const token = $route.current.params.token;
  return $http.get(`api/dashboards/public/${token}`).then(response => response.data);
}

const PublicDashboardPage = {
  template,
  bindings: {
    dashboard: '<',
  },
  controller($timeout, $location, $http, $route, $q, $routeParams, $rootScope, $scope, Dashboard) {
    'ngInject';

    this.public = true;
    this.dashboard.widgets = Dashboard.prepareDashboardWidgets(this.dashboard.widgets);
    const refreshRate = Math.max(30, parseFloat($location.search().refresh));

    const collectFilters = (dashboard, forceRefresh) => {
      const queryResultPromises = _.compact(this.dashboard.widgets.map(widget => widget.load(forceRefresh)));

      $q.all(queryResultPromises).then((queryResults) => {
        const filters = {};
        queryResults.forEach((queryResult) => {
          const queryFilters = queryResult.getFilters();
          queryFilters.forEach((queryFilter) => {
            const hasQueryStringValue = _.has($location.search(), queryFilter.name);

            if (hasQueryStringValue) {
              queryFilter.current = $location.search()[queryFilter.name];
            }

            if (!_.has(filters, queryFilter.name)) {
              const filter = _.extend({}, queryFilter);
              filters[filter.name] = filter;
              filters[filter.name].originFilters = [];
            }

            filters[queryFilter.name].originFilters.push(queryFilter);
          });
        });

        this.filters = _.values(filters);
        this.filtersOnChange = (filter) => {
          _.each(filter.originFilters, (originFilter) => {
            originFilter.current = filter.current;
          });
        };
      });
    };

    this.showDashboardFilters = () => {
      collectFilters(this.dashboard, undefined);
    };

    this.showDashboardFilters();

    if (refreshRate) {
      const refresh = () => {
        loadDashboard($http, $route).then((data) => {
          this.dashboard = data;
          this.dashboard.widgets = Dashboard.prepareDashboardWidgets(this.dashboard.widgets);
          $timeout(refresh, refreshRate * 1000.0);
        });
      };

      $timeout(refresh, refreshRate * 1000.0);
    }

    // 从url中获取是否显示标题的参数
    this.showTitle = $routeParams.show_title;

    // 从url中获取主题名称的参数，然后引用此样式文件
    const theme = $routeParams.theme;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './static/' + theme + '.css';
    document.head.appendChild(link);

    $scope.theme = theme;
  },
};

export default function init(ngModule) {
  ngModule.component('publicDashboardPage', PublicDashboardPage);

  function loadPublicDashboard($http, $route) {
    'ngInject';

    return loadDashboard($http, $route);
  }

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
        dashboard: loadPublicDashboard,
        session,
      },
    });
  });

  return [];
}

init.init = true;

