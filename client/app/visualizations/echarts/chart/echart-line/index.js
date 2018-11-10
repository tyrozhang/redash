import _ from 'lodash';
import { PrepareChartOption } from '@/visualizations/echarts/chart/utils';
import * as echarts from 'echarts';
import editorTemplate from '../echart-editor.html';


const DEFAULT_OPTIONS = {};


function LineRenderer() {
  return {
    restrict: 'E',
    template: '<div class="echarts-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-visualization-container');
      const myChart = echarts.init(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const lineChart = new PrepareChartOption();
        if (editOptions.Xaxis) {
          lineChart.prepareData(lineChart, data, editOptions);
          lineChart.setSeriesData('line');
        }

        myChart.setOption(lineChart.chartOption, true);
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

function LineEditor() {
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
      if (!$scope.visualization.options.editOptions) $scope.visualization.options.editOptions = editOptions;
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
      defaultOptions: DEFAULT_OPTIONS,
    });
  });
}
