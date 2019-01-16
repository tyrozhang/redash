import * as _ from 'lodash';


function getParamsStr(params, newFilters, catalogValue, groupValue) {
  params = params + newFilters[0].name + '=' + catalogValue;
  if (newFilters.length === 2) {
    params = params + '&' + newFilters[1].name + '=' + groupValue;
  }
  return params;
}

// 执行钻取跳转的方法
function executeDataDrilling($q, widgets, catalogValue, groupValue, drillingUrl, char) {
  const queryResultPromises = _.compact(widgets.map(widget => widget.load(undefined)));

  $q.all(queryResultPromises)
    .then((queryResults) => {
      const filters = {};
      queryResults.forEach((queryResult) => {
        const queryFilters = queryResult.getFilters();
        queryFilters.forEach((queryFilter) => {
          if (!_.has(filters, queryFilter.name)) {
            const filter = _.extend({}, queryFilter);
            filters[filter.name] = filter;
            filters[filter.name].originFilters = [];
          }
        });
      });
      const newFilters = _.values(filters);
      const params = getParamsStr(char, newFilters, catalogValue, groupValue);
      window.location.href = drillingUrl + params;
    });
}


function session(Auth, apiKey) {
  Auth.setApiKey(apiKey);
  Auth.loadConfig();
}

function dataDrilling($location, $q, Dashboard, $http, Auth, selectSlug, chart) {
  const catalogValue = chart.name;
  const groupValue = chart.seriesName;

  if (Auth.isAuthenticated()) {
    Dashboard.get(
      { slug: selectSlug },
      (dashboard) => {
        const drillingUrl = '/dashboard/' + selectSlug;
        executeDataDrilling($q, dashboard.widgets, catalogValue, groupValue, drillingUrl, '?');
      },
    );
  } else {
    $http.get('/dashboards/' + selectSlug + '/share/token')
      .then((data) => {
        const apiKey = data.data.api_key;
        const drillingUrl = '/public/dashboards/' + apiKey + '?org_slug=default';

        session(Auth, apiKey);

        $http.get('api/dashboards/public/' + apiKey)
          .then((response) => {
            const dashboard = response.data;
            const widgets = Dashboard.prepareDashboardWidgets(dashboard.widgets);
            executeDataDrilling($q, widgets, catalogValue, groupValue, drillingUrl, '&');
          });
      });
  }
}

function getHasFiltersDashboards(Dashboard) {
  const dashboardsList = [];
  Dashboard.query((data) => {
    const results = data.results;

    _.each(results, (dashboard) => {
      if (dashboard.dashboard_filters_enabled) {
        dashboardsList.push(dashboard);
      }
    });
  });
  return dashboardsList;
}

export { dataDrilling, getHasFiltersDashboards };
