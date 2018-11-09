import * as echarts from 'echarts';
import editorTemplate from './bar-editor.html';
import PrepareChartOption from '../utils';


function BarRenderer() {
  return {
    restrict: 'E',
    template: '<div class="signal-gauge-visualization-container"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.signal-gauge-visualization-container');
      const myChart = echarts.init(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;

        const barChart = new PrepareChartOption();
        if (editOptions.horizontalBar) {
          barChart.setyAxisType('category');
          barChart.setxAxisType('value');
        } else {
          barChart.setxAxisType('category');
          barChart.setyAxisType('value');
        }

        barChart.setValueColumns(editOptions.Xaxis);
        barChart.setValueColumns(editOptions.Yaxis);
        barChart.setGroupBy(editOptions.groupby);
        barChart.setResult(data);
        barChart.chartHelper.init(data, editOptions.Xaxis, editOptions.Yaxis, editOptions.groupby);

        barChart.setAxisData();
        barChart.setBarLineSeriesData('bar');
        barChart.hasLegend(editOptions.legend);
        barChart.setValueMax(editOptions.rangeMax);
        barChart.setValueMin(editOptions.rangeMin);
        barChart.setXLabel(editOptions.xName);
        barChart.setYLabel(editOptions.yName);

        barChart.chartOption.xAxis.show = !!editOptions.concealXLabels;

        myChart.setOption(barChart.chartOption, true);
      }

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
        concealXLabels: true,
        legend: true,
        barTitle: '',
        Xaxis: '',
        Yaxis: '',
        groupBy: '',
      };
      if (!$scope.visualization.options.editOptions) $scope.visualization.options.editOptions = editOptions;
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
