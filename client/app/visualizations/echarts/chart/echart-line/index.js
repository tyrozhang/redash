import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { LineOption, onClick } from '@/visualizations/echarts/chart/utils';
import editorTemplate from '@/visualizations/echarts/chart/echart-editor.html';


function LineRenderer($location, currentUser, Dashboard) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const myChart = echartFactory.init(container);

      if ($scope.visualization.options.dashboard) {
        // 得到页面上选择dashboard的slug
        const selectSlug = $scope.visualization.options.dashboard.slug;
        onClick($location, myChart, selectSlug, Dashboard);
      }

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const lineChart = new LineOption();

        if (editOptions.categoryColumn) {
          lineChart.chartOption.categoryColumn = editOptions.categoryColumn;
          lineChart.chartOption.valueColumns = editOptions.valueColumns;
          lineChart.chartOption.result = data;
          lineChart.chartOption.groupByColumn = editOptions.groupBy;
          lineChart.chartHelper.init(data, editOptions.categoryColumn, editOptions.valueColumns, editOptions.groupBy);
          lineChart.setAxisData();
          lineChart.inclineContent(editOptions.horizontalBar);
          lineChart.setLegend(editOptions.legend);
          lineChart.setValueMax(editOptions.rangeMax);
          lineChart.setValueMin(editOptions.rangeMin);
          lineChart.chartOption.xAxis.name = editOptions.xName;
          lineChart.chartOption.yAxis.name = editOptions.yName;
          lineChart.setSeriesData('line');
        }

        echartFactory.setOption(myChart, lineChart.chartOption, true);
      }

      function resize() {
        window.onresize = myChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function LineEditor(Dashboard) {
  return {
    restrict: 'E',
    template: editorTemplate,
    link($scope) {
      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      const editOptions = {
        legend: true,
      };
      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;

      // 获取dashboard集合
      $scope.visualization.options.dashboardsList = Dashboard.query();
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('lineRenderer', LineRenderer);
  ngModule.directive('lineEditor', LineEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<line-renderer options="visualization.options" query-result="queryResult"></line-renderer>';
    const editTemplate = '<line-editor options="visualization.options" query-result="queryResult"></line-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-line',
      name: '折线图',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}
