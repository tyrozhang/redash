import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { dataDrilling, getHasFiltersDashboards } from '@/visualizations/echarts/chart/data-drilling/util';
import chartIcon from '@/assets/images/visualizationIcons/icon_pie.png';
import PieOption from './pie-utils';
import editorTemplate from './pie-editor.html';


function PieRenderer($location, $q, currentUser, Dashboard, $http, Auth) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const pieChart = echartFactory.createChart(container);

      if ($scope.visualization.options.dataDrillingDashboard) {
        // 得到页面上选择dashboard的slug
        const selectSlug = $scope.visualization.options.dataDrillingDashboard.slug;
        pieChart.on('click', chart => dataDrilling($location, $q, Dashboard, $http, Auth, selectSlug, chart));
      }

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const pieExamples = new PieOption();

        pieExamples.pieOption.xAxis = editOptions.categoryColumn;
        pieExamples.pieOption.valueColumns = editOptions.valueColumns;
        pieExamples.pieOption.groupByColumn = editOptions.groupBy;
        pieExamples.pieOption.result = data;
        pieExamples.chartHelper.init(data, editOptions.categoryColumn, editOptions.valueColumns, editOptions.groupBy);
        pieExamples.setPieSeriesData();
        pieExamples.setRoseType(editOptions.roseType);
        pieExamples.setDoughnut(editOptions.doughnut);
        pieExamples.setLegend(editOptions.hasLegend);
        pieExamples.setPieLabel(editOptions.hasLabel);
        pieExamples.setPieTitle();

        echartFactory.setOption(pieChart, pieExamples.pieOption);
      }

      function resize() {
        window.onresize = pieChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function PieEditor(Dashboard) {
  return {
    restrict: 'E',
    template: editorTemplate,
    link($scope) {
      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      const editOptions = {
        hasLegend: true,
        hasLabel: true,
      };
      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;
      // 获取dashboard集合
      $scope.visualization.options.dashboardsList = getHasFiltersDashboards(Dashboard);
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
      icon: chartIcon,
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}

init.init = true;
