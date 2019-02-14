import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import chartIcon from '@/assets/images/visualizationIcons/icon_progress.png';
import ProgressOption from './progress-utils';
import editorTemplate from './progress-editor.html';


function ProgressRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      let container = element[0].querySelector('.echarts-chart-visualization-container');
      let echartFactory = new EchartsFactory($location, currentUser, '');
      let progressChart = echartFactory.createChart(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const progressExamples = new ProgressOption();

        if (editOptions.valueColumn && editOptions.categoryColumn) {
          progressExamples.chartHelper
            .init(data, editOptions.categoryColumn, editOptions.valueColumn, editOptions.totalValueColumn);
          progressExamples.setProgressOption();
          progressExamples.setAxisLabel();
        }

        echartFactory.setOption(progressChart, progressExamples.progressOption);
      }

      function resize() {
        window.onresize = progressChart.resize;
      }

      function changTheme() {
        progressChart.dispose();
        echartFactory = new EchartsFactory($location, currentUser, $scope.theme);
        container = element[0].querySelector('.echarts-chart-visualization-container');
        progressChart = echartFactory.createChart(container);
        reloadData();
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
      $scope.$watch('theme', changTheme, true);
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
    const renderTemplate = '<progress-renderer options="visualization.options" theme="theme" query-result="queryResult"></progress-renderer>';
    const editTemplate = '<progress-editor options="visualization.options" query-result="queryResult"></progress-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-progress',
      name: '进度条',
      icon: chartIcon,
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}

init.init = true;
