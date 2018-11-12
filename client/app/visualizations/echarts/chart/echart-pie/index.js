import _ from 'lodash';
import { PreparePieOption } from '@/visualizations/echarts/chart/utils';
import * as echarts from 'echarts';
import editorTemplate from '../echart-editor.html';

const DEFAULT_OPTIONS = {};


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
        const pieChart = new PreparePieOption();

        pieChart.pieOption.categoryColumn = editOptions.xAxis;
        pieChart.pieOption.valueColumns = editOptions.yAxis;
        pieChart.pieOption.groupByColumn = editOptions.groupby;
        pieChart.pieOption.result = data;
        pieChart.pieOption.title.text = editOptions.pieTitle;
        pieChart.chartHelper.init(data, editOptions.xAxis, editOptions.yAxis, editOptions.groupby);
        pieChart.setPieSeriesData();
        pieChart.hasLegend(editOptions.legend);
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
        pieTitle: '',
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
      defaultOptions: DEFAULT_OPTIONS,
    });
  });
}
