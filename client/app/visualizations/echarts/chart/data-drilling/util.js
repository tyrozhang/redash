import each from 'lodash';

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

  // isAuthenticated���ΪTrueʱ����ʾΪ��¼�û���ʹ�û�༭�ÿ��ӻ�������Ϊͨ��token����ÿ��ӻ�
  if (Auth.isAuthenticated()) {
    // ����ѡ���dashboard��slug����dashboard��Ϊ�˵õ�dashboard��widgets
    Dashboard.get(
      { slug: selectSlug },
      (dashboard) => {
        const widgets = dashboard.widgets;
        // �õ�ȫ�ֲ���
        const globalParams = Dashboard.getGlobalParams(widgets);

        // ƴ�Ӳ����ַ���
        const params = getParamsStr('?', globalParams, catalogValue, groupValue);

        const url = '/dashboard/' + selectSlug + params;
        window.location.href = url;
      },
    );
  } else {
    $http.get('/dashboards/' + selectSlug + '/share/token')
      .then((data) => {
        const apiKey = data.data.api_key;

        // ע��apiKey,д��session��
        session(Auth, apiKey);

        $http.get('api/dashboards/public/' + apiKey)
          .then((response) => {
            const dashboard = response.data;
            const widgets = Dashboard.prepareDashboardWidgets(dashboard.widgets);

            // �õ�ȫ�ֲ���
            const globalParams = Dashboard.getGlobalParams(widgets);

            // ƴ�Ӳ����ַ���
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
