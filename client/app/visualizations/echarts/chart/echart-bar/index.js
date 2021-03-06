import _ from 'lodash';
import { BarOption } from '@/visualizations/echarts/chart/utils';
import { dataDrilling, getHasFiltersDashboards } from '@/visualizations/echarts/chart/data-drilling/util';
import { ColorPalette } from '@/visualizations/chart/plotly/utils';
import chartIcon from '@/assets/images/visualizationIcons/icon_bar.png';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import editorTemplate from './bar-editor.html';


function BarRenderer($location, $q, currentUser, Dashboard, $http, Auth) {
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
        barChart.on('click', chart => dataDrilling($location, $q, Dashboard, $http, Auth, selectSlug, chart));
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

        // 当更改了轴类型并且为横向柱状图时，对轴类型进行设置
        if (editOptions.horizontalAxisType && editOptions.horizontalBar) {
          if (editOptions.horizontalAxisType.value === 'log') {
            barExamples.chartOption.xAxis.type = editOptions.horizontalAxisType.value;
          } else {
            barExamples.chartOption.yAxis.type = editOptions.horizontalAxisType.value;
          }
        }

        // 当更改了轴类型，为纵向柱状图时，对轴类型进行设置
        if (editOptions.horizontalAxisType && !editOptions.horizontalBar) {
          if (editOptions.horizontalAxisType.value === 'log') {
            barExamples.chartOption.yAxis.type = editOptions.horizontalAxisType.value;
          } else {
            barExamples.chartOption.xAxis.type = editOptions.horizontalAxisType.value;
          }
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

        if (editOptions.showMarkLine) {
          if (editOptions.markLineValue) barExamples.setMarkLine(editOptions.markLineValue);
          if (editOptions.markLineColor) barExamples.setMarkLineColor(editOptions.markLineColor.value);
        }

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

      $scope.colors = ColorPalette;

      $scope.axisTypes = {
        类目轴: 'category',
        时间轴: 'time',
        对数轴: 'log',
      };

      const editOptions = {
        conversion: false,
        legend: true,
        categoryColumn: '',
        valueColumns: '',
      };
      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;

      $scope.visualization.options.dashboardsList = getHasFiltersDashboards(Dashboard);
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
      icon: chartIcon,
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}

init.init = true;
