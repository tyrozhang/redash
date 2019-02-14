import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import chartIcon from '@/assets/images/visualizationIcons/icon_bubble.png';
import BubbleOption from './bubble-utils';
import editorTemplate from './bubble-editor.html';


function BubbleRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      let container = element[0].querySelector('.echarts-chart-visualization-container');
      let echartFactory = new EchartsFactory($location, currentUser, '');
      let bubbleChart = echartFactory.createChart(container);


      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const bubbleExamples = new BubbleOption();

        if (!editOptions.xValueColumn) {
          echartFactory.setOption(bubbleChart, (new BubbleOption()).chartOption);
          return;
        }

        bubbleExamples.chartOption.xValueColumn = editOptions.xValueColumn;
        bubbleExamples.chartOption.yValueColumn = editOptions.yValueColumn;
        bubbleExamples.chartOption.nameColumn = editOptions.nameColumns;
        bubbleExamples.chartOption.result = data;
        bubbleExamples.chartOption.groupByColumn = editOptions.groupBy;
        bubbleExamples.chartHelper
          .init(data, editOptions.xValueColumn, editOptions
            .yValueColumn, editOptions.groupBy, editOptions.nameColumns);
        bubbleExamples.setLegend(editOptions.legend);
        bubbleExamples.chartOption.yAxis.max = editOptions.yAxisMax;
        bubbleExamples.chartOption.yAxis.min = editOptions.yAxisMin;
        bubbleExamples.chartOption.xAxis.max = editOptions.xAxisMax;
        bubbleExamples.chartOption.xAxis.min = editOptions.xAxisMin;
        bubbleExamples.chartOption.xAxis.name = editOptions.xName;
        bubbleExamples.chartOption.yAxis.name = editOptions.yName;
        bubbleExamples.setBubbleData();

        echartFactory.setOption(bubbleChart, bubbleExamples.chartOption);
      }

      function resize() {
        window.onresize = bubbleChart.resize;
      }

      function changTheme() {
        bubbleChart.dispose();
        echartFactory = new EchartsFactory($location, currentUser, $scope.theme);
        container = element[0].querySelector('.echarts-chart-visualization-container');
        bubbleChart = echartFactory.createChart(container);
        reloadData();
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
      $scope.$watch('theme', changTheme, true);
    },
  };
}

function BubbleEditor() {
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
  ngModule.directive('bubbleRenderer', BubbleRenderer);
  ngModule.directive('bubbleEditor', BubbleEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<bubble-renderer options="visualization.options" theme="theme" query-result="queryResult"></bubble-renderer>';
    const editTemplate = '<bubble-editor options="visualization.options" query-result="queryResult"></bubble-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-bubble',
      name: '气泡图',
      icon: chartIcon,
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}

init.init = true;
