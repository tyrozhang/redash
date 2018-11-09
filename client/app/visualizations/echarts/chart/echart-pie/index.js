import PrepareChartOption from '@/visualizations/echarts/chart/utils';
import * as echarts from 'echarts';
import editorTemplate from './pie-editor.html';

const DEFAULT_OPTIONS = {};


function PieRenderer() {
  return {
    restrict: 'E',
    template: '<div class="signal-gauge-visualization-container"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.signal-gauge-visualization-container');
      const myChart = echarts.init(container, 'light');

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
        barChart.setPieSeriesData();
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
        legend: '',
        pieLabel: '',
        Xaxis: '',
        Yaxis: '',
      };
      if (!$scope.visualization.options.editOptions) $scope.visualization.options.editOptions = editOptions;
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
