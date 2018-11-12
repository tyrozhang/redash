import _ from 'lodash';
import * as echarts from 'echarts';
import { PieOption } from '@/visualizations/echarts/chart/utils';
import editorTemplate from '@/visualizations/echarts/chart/echart-editor.html';


function PieRenderer() {
  return {
    restrict: 'E',
    template: '<div class="echarts-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-visualization-container');
      const myChart = echarts.init(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const pieChart = new PieOption();

        pieChart.pieOption.xAxis = editOptions.categoryColumn;
        pieChart.pieOption.valueColumns = editOptions.valueColumns;
        pieChart.pieOption.groupByColumn = editOptions.groupBy;
        pieChart.pieOption.result = data;
        pieChart.chartHelper.init(data, editOptions.categoryColumn, editOptions.valueColumns, editOptions.groupBy);
        pieChart.setPieSeriesData();
        pieChart.setLegend(editOptions.legend);

        myChart.setOption(pieChart.pieOption, true);
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

function PieEditor() {
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
  ngModule.directive('pieRenderer', PieRenderer);
  ngModule.directive('pieEditor', PieEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<pie-renderer options="visualization.options" query-result="queryResult"></pie-renderer>';
    const editTemplate = '<pie-editor options="visualization.options" query-result="queryResult"></pie-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-pie',
      name: '饼图',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}
