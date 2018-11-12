import _ from 'lodash';
import * as echarts from 'echarts';
import editorTemplate from '../echart-editor.html';
import { PrepareChartOption } from '../utils';


function BarRenderer() {
  return {
    restrict: 'E',
    template: '<div class="echarts-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-visualization-container');
      const myChart = echarts.init(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const barChart = new PrepareChartOption();

        if (editOptions.xAxis) {
          if (editOptions.horizontalBar) {
            barChart.chartOption.yAxis.type = 'category';
            barChart.chartOption.xAxis.type = 'value';
          } else {
            barChart.chartOption.xAxis.type = 'category';
            barChart.chartOption.yAxis.type = 'value';
          }
          barChart.prepareData(barChart, data, editOptions);
          barChart.setSeriesData('bar');
        }

        myChart.setOption(barChart.chartOption, true);
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
function BarEditor() {
  return {
    restrict: 'E',
    template: editorTemplate,
    link($scope) {
      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      const editOptions = {
        conversion: false,
        legend: true,
        xAxis: '',
        yAxis: '',
      };
      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('barRenderer', BarRenderer);
  ngModule.directive('barEditor', BarEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<bar-renderer options="visualization.options" query-result="queryResult"></bar-renderer>';
    const editTemplate = '<bar-editor options="visualization.options" query-result="queryResult"></bar-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-bar',
      name: '柱状图',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}
