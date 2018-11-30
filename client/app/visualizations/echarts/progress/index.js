import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { ProgressOption } from './progress-utils';
import editorTemplate from './progress-editor.html';


function ProgressRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const progressChart = echartFactory.createChart(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const progressExamples = new ProgressOption();

        if (editOptions.valueColumn && editOptions.categoryColumn) {
          progressExamples.chartHelper
            .init(data, editOptions.categoryColumn, editOptions.valueColumn, editOptions.totalValueColumn);
          progressExamples.setProgressOption();
        }

        echartFactory.setOption(progressChart, progressExamples.progressOption);
      }

      function resize() {
        window.onresize = progressChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function ProgressEditor() {
  return {
    restrict: 'E',
    template: editorTemplate,
    link($scope) {
      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };

      const editOptions = {};
      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('progressRenderer', ProgressRenderer);
  ngModule.directive('progressEditor', ProgressEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<progress-renderer options="visualization.options" query-result="queryResult"></progress-renderer>';
    const editTemplate = '<progress-editor options="visualization.options" query-result="queryResult"></progress-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-progress',
      name: '进度条',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}

init.init = true;
