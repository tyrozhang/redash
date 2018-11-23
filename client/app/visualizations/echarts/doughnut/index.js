import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { DoughnutOption } from './doughnut-utils';
import editorTemplate from './doughnut-editor.html';


function DoughnutRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const doughnutChart = echartFactory.createChart(container);


      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const doughnutExamples = new DoughnutOption();

        if (editOptions.categoryColumn && editOptions.valueColumns) {
          doughnutExamples.pieOption.result = data;
          doughnutExamples.chartHelper.init(data, editOptions.categoryColumn, editOptions.valueColumns);
          doughnutExamples.setDoughnutData();
          doughnutExamples.setLegend(editOptions.legend);
        }

        echartFactory.setOption(doughnutChart, doughnutExamples.pieOption);
      }

      function resize() {
        window.onresize = doughnutChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function DoughnutEditor() {
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
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('doughnutRenderer', DoughnutRenderer);
  ngModule.directive('doughnutEditor', DoughnutEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<doughnut-renderer options="visualization.options" query-result="queryResult"></doughnut-renderer>';
    const editTemplate = '<doughnut-editor options="visualization.options" query-result="queryResult"></doughnut-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-doughnut',
      name: '圆环图',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}
