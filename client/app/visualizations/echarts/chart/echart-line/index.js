import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { LineOption, onClick } from '@/visualizations/echarts/chart/utils';
import editorTemplate from './line-editor.html';


function LineRenderer($location, currentUser, Dashboard) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const lineChart = echartFactory.createChart(container);

      if ($scope.visualization.options.dashboard) {
        // 得到页面上选择dashboard的slug
        const selectSlug = $scope.visualization.options.dashboard.slug;
        onClick($location, lineChart, selectSlug, Dashboard);
      }

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const lineExamples = new LineOption();

        if (!editOptions.categoryColumn) {
          echartFactory.setOption(lineChart, (new LineOption()).chartOption);
          return;
        }

        lineExamples.chartOption.categoryColumn = editOptions.categoryColumn;
        lineExamples.chartOption.valueColumns = editOptions.valueColumns;
        lineExamples.chartOption.result = data;
        lineExamples.chartOption.groupByColumn = editOptions.groupBy;
        lineExamples.chartHelper.init(data, editOptions.categoryColumn, editOptions.valueColumns, editOptions.groupBy);
        lineExamples.setCategoryData();
        lineExamples.inclineContent(editOptions.horizontalBar);
        lineExamples.setLegend(editOptions.legend);
        lineExamples.setValueMax(editOptions.rangeMax);
        lineExamples.setValueMin(editOptions.rangeMin);
        lineExamples.chartOption.xAxis.name = editOptions.xName;
        lineExamples.chartOption.yAxis.name = editOptions.yName;
        lineExamples.chartOption.xAxis.boundaryGap = false;
        lineExamples.setSeriesData('line');
        lineExamples.setShowValueLabel(editOptions.showValueLabel);
        lineExamples.setAreaStyle(editOptions.areaStyle);
        lineExamples.setSmoothStyle(editOptions.smoothStyle);
        lineExamples.setLineStyle(editOptions.lineStyle);

        echartFactory.setOption(lineChart, lineExamples.chartOption);
      }

      function resize() {
        window.onresize = lineChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function LineEditor(Dashboard) {
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

      $scope.lineStyle = {
        实线: 'solid',
        虚线: 'dashed',
        点状线: 'dotted',
      };
      // 获取dashboard集合
      $scope.visualization.options.dashboardsList = Dashboard.query();
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
    });
  });
}
