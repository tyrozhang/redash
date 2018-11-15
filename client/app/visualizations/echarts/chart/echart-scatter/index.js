import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { ScatterOption } from './utils';
import editorTemplate from './scatter-editor.html';


function ScatterRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const myChart = echartFactory.init(container);


      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const scatterChart = new ScatterOption();
        const scatterOptions = scatterChart.chartOption;

        if (editOptions.categoryColumn) {
          scatterOptions.categoryColumn = editOptions.categoryColumn;
          scatterOptions.valueColumns = editOptions.valueColumns;
          scatterOptions.nameColumn = editOptions.nameColumns;
          scatterOptions.result = data;
          scatterOptions.groupByColumn = editOptions.groupBy;
          scatterChart.chartHelper
            .init(data, editOptions.categoryColumn, editOptions
              .valueColumns, editOptions.groupBy, editOptions.nameColumns);
          scatterChart.setLegend(editOptions.legend);
          scatterOptions.yAxis.max = editOptions.rangeMax;
          scatterOptions.yAxis.min = editOptions.rangeMin;
          scatterOptions.xAxis.max = editOptions.rangeXMax;
          scatterOptions.xAxis.min = editOptions.rangeXMin;
          scatterOptions.xAxis.name = editOptions.xName;
          scatterOptions.yAxis.name = editOptions.yName;
          scatterChart.setScatterData();
        }

        echartFactory.setOption(myChart, scatterOptions, true);
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

function ScatterEditor() {
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
  ngModule.directive('scatterRenderer', ScatterRenderer);
  ngModule.directive('scatterEditor', ScatterEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<scatter-renderer options="visualization.options" query-result="queryResult"></scatter-renderer>';
    const editTemplate = '<scatter-editor options="visualization.options" query-result="queryResult"></scatter-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-scatter',
      name: '散点图',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}
