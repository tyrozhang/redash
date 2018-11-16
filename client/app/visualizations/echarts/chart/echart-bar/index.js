import _ from 'lodash';
import { BarOption, onClick } from '@/visualizations/echarts/chart/utils';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import editorTemplate from './bar-editor.html';


function BarRenderer($location, currentUser, Dashboard) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const myChart = echartFactory.init(container);

      if ($scope.visualization.options.dashboard) {
        // 得到页面上选择dashboard的slug
        const selectSlug = $scope.visualization.options.dashboard.slug;
        onClick($location, myChart, selectSlug, Dashboard);
      }

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const barChart = new BarOption();

        if (editOptions.categoryColumn) {
          if (editOptions.horizontalBar) {
            barChart.chartOption.yAxis.type = 'category';
            barChart.chartOption.xAxis.type = 'value';
          } else {
            barChart.chartOption.xAxis.type = 'category';
            barChart.chartOption.yAxis.type = 'value';
          }

          barChart.chartOption.categoryColumn = editOptions.categoryColumn;
          barChart.chartOption.valueColumns = editOptions.valueColumns;
          barChart.chartOption.result = data;
          barChart.chartOption.groupByColumn = editOptions.groupBy;
          barChart.chartHelper.init(data, editOptions.categoryColumn, editOptions.valueColumns, editOptions.groupBy);
          barChart.setAxisData();
          barChart.inclineContent(editOptions.horizontalBar);
          barChart.setLegend(editOptions.legend);
          barChart.setValueMax(editOptions.rangeMax);
          barChart.setValueMin(editOptions.rangeMin);
          barChart.chartOption.xAxis.name = editOptions.xName;
          barChart.chartOption.yAxis.name = editOptions.yName;
          barChart.setSeriesData('bar');
          barChart.setShowValueLabel(editOptions.showValueLabel);
          barChart.setStack(editOptions.stack);
        }

        echartFactory.setOption(myChart, barChart.chartOption, true);
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

function BarEditor(Dashboard) {
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
        categoryColumn: '',
        valueColumns: '',
      };
      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;

      // 获取dashboard集合
      $scope.visualization.options.dashboardsList = Dashboard.query();
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
