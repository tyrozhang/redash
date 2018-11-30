import _ from 'lodash';
import { BarOption, dataDrilling } from '@/visualizations/echarts/chart/utils';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import editorTemplate from './bar-editor.html';


function BarRenderer($location, currentUser, Dashboard, $http, Auth) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const barChart = echartFactory.createChart(container);

      if ($scope.visualization.options.dataDrillingDashboard) {
        // 得到页面上选择dashboard的slug
        const selectSlug = $scope.visualization.options.dataDrillingDashboard.slug;
        barChart.on('click', chart => dataDrilling($location, Dashboard, $http, Auth, selectSlug, chart));
      }

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const barExamples = new BarOption();

        if (!editOptions.categoryColumn) {
          echartFactory.setOption(barChart, (new BarOption()).chartOption);
          return;
        }

        if (editOptions.horizontalBar) {
          barExamples.chartOption.yAxis.type = 'category';
          barExamples.chartOption.xAxis.type = 'value';
        } else {
          barExamples.chartOption.xAxis.type = 'category';
          barExamples.chartOption.yAxis.type = 'value';
        }

        barExamples.chartOption.categoryColumn = editOptions.categoryColumn;
        barExamples.chartOption.valueColumns = editOptions.valueColumns;
        barExamples.chartOption.result = data;
        barExamples.chartOption.groupByColumn = editOptions.groupBy;
        barExamples.chartHelper.init(data, editOptions.categoryColumn, editOptions.valueColumns, editOptions.groupBy);
        barExamples.setCategoryData();
        barExamples.inclineContent(editOptions.horizontalBar);
        barExamples.setLegend(editOptions.legend);
        barExamples.setValueMax(editOptions.rangeMax);
        barExamples.setValueMin(editOptions.rangeMin);
        barExamples.chartOption.xAxis.name = editOptions.xName;
        barExamples.chartOption.yAxis.name = editOptions.yName;
        barExamples.setSeriesData('bar');
        barExamples.setShowValueLabel(editOptions.showValueLabel);
        barExamples.setStack(editOptions.stack);

        echartFactory.setOption(barChart, barExamples.chartOption);
      }

      function resize() {
        window.onresize = barChart.resize;
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

init.init = true;
