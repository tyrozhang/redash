import PrepareChartOption from '@/visualizations/echarts/chart/utils';
import * as echarts from 'echarts';
import editorTemplate from './line-editor.html';


const DEFAULT_OPTIONS = {};


function LineRenderer() {
  return {
    restrict: 'E',
    template: '<div class="signal-gauge-visualization-container"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.signal-gauge-visualization-container');
      const myChart = echarts.init(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;

        const lineChart = new PrepareChartOption();
        if (editOptions.horizontalBar) {
          lineChart.setyAxisType('category');
          lineChart.setxAxisType('value');
        } else {
          lineChart.setxAxisType('category');
          lineChart.setyAxisType('value');
        }

        lineChart.setValueColumns(editOptions.Xaxis);
        lineChart.setValueColumns(editOptions.Yaxis);
        lineChart.setGroupBy(editOptions.groupby);
        lineChart.setResult(data);
        lineChart.chartHelper.init(data, editOptions.Xaxis, editOptions.Yaxis, editOptions.groupby);

        lineChart.setAxisData();
        lineChart.setBarLineSeriesData('line');
        lineChart.hasLegend(editOptions.legend);
        lineChart.setValueMax(editOptions.rangeMax);
        lineChart.setValueMin(editOptions.rangeMin);
        lineChart.setXLabel(editOptions.xName);
        lineChart.setYLabel(editOptions.yName);

        lineChart.chartOption.xAxis.show = !!editOptions.concealXLabels;

        myChart.setOption(lineChart.chartOption, true);
      }

      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function LineEditor() {
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
  ngModule.directive('lineRenderer', LineRenderer);
  ngModule.directive('lineEditor', LineEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<line-renderer options="visualization.options" query-result="queryResult"></line-renderer>';
    const editTemplate = '<line-editor options="visualization.options" query-result="queryResult"></line-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-line',
      name: '折线图',
      renderTemplate,
      editorTemplate: editTemplate,
      defaultOptions: DEFAULT_OPTIONS,
    });
  });
}
