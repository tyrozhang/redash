import { each } from 'lodash';

function getParamsStr(params, globalParams, catalogValue, groupValue) {
  params = params + 'p_' + globalParams[0].name + '=' + catalogValue;
  if (globalParams.length === 2) {
    params = params + '&p_' + globalParams[1].name + '=' + groupValue;
  }
  return params;
}

function session(Auth, apiKey) {
  Auth.setApiKey(apiKey);
  Auth.loadConfig();
}

function dataDrilling($location, Dashboard, $http, Auth, selectSlug, chart) {
  const catalogValue = chart.name;
  const groupValue = chart.seriesName;

  // isAuthenticated结果为True时，表示为登录用户在使用或编辑该可视化，否则为通过token浏览该可视化
  if (Auth.isAuthenticated()) {
    // 根据选择的dashboard的slug查找dashboard，为了得到dashboard的widgets
    Dashboard.get(
      { slug: selectSlug },
      (dashboard) => {
        const widgets = dashboard.widgets;
        // 得到全局参数
        const globalParams = Dashboard.getGlobalParams(widgets);

        // 拼接参数字符串
        const params = getParamsStr('?', globalParams, catalogValue, groupValue);

        const url = '/dashboard/' + selectSlug + params;
        window.location.href = url;
      },
    );
  } else {
    $http.get('/dashboards/' + selectSlug + '/share/token')
      .then((data) => {
        const apiKey = data.data.api_key;

        // 注册apiKey,写入session中
        session(Auth, apiKey);

        $http.get('api/dashboards/public/' + apiKey)
          .then((response) => {
            const dashboard = response.data;
            const widgets = Dashboard.prepareDashboardWidgets(dashboard.widgets);

            // 得到全局参数
            const globalParams = Dashboard.getGlobalParams(widgets);

            // 拼接参数字符串
            const params = getParamsStr('&', globalParams, catalogValue, groupValue);

            const url = '/public/dashboards/' + apiKey + '?org_slug=default' + params;
            window.location.href = url;
          });
      });
  }
}

function getHasFiltersDashboards(Dashboard) {
  const dashboardsList = [];
  Dashboard.query((data) => {
    const results = data.results;

    each(results, (dashboard) => {
      Dashboard.get(
        { slug: dashboard.slug },
        (result) => {
          const globalParams = Dashboard.getGlobalParams(result.widgets);

          if (globalParams.length > 0) {
            dashboardsList.push(dashboard);
          }
        },
      );
    });
  });
  return dashboardsList;
}

export { dataDrilling, getHasFiltersDashboards };
