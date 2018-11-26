import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { ScatterOption, onClick } from '@/visualizations/echarts/chart/utils';
import editorTemplate from './scatter-editor.html';


function ScatterRenderer($location, currentUser, Dashboard) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const scatterChart = echartFactory.createChart(container);

      if ($scope.visualization.options.dashboard) {
        // 得到页面上选择dashboard的slug
        const selectSlug = $scope.visualization.options.dashboard.slug;
        onClick($location, scatterChart, selectSlug, Dashboard);
      }

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const scatterExamples = new ScatterOption();

        if (!editOptions.categoryColumn) {
          echartFactory.setOption(scatterChart, (new ScatterOption()).chartOption);
          return;
        }

        scatterExamples.chartOption.categoryColumn = editOptions.categoryColumn;
        scatterExamples.chartOption.valueColumns = editOptions.valueColumns;
        scatterExamples.chartOption.result = data;
        scatterExamples.chartOption.groupByColumn = editOptions.groupBy;
        scatterExamples.chartHelper
          .init(data, editOptions.categoryColumn, editOptions.valueColumns, editOptions.groupBy);
        scatterExamples.setCategoryData();
        scatterExamples.inclineContent(editOptions.horizontalBar);
        scatterExamples.setLegend(editOptions.legend);
        scatterExamples.setValueMax(editOptions.rangeMax);
        scatterExamples.setValueMin(editOptions.rangeMin);
        scatterExamples.chartOption.xAxis.name = editOptions.xName;
        scatterExamples.chartOption.yAxis.name = editOptions.yName;
        scatterExamples.chartOption.xAxis.boundaryGap = false;
        scatterExamples.setSeriesData('scatter');
        scatterExamples.setShowValueLabel(editOptions.showValueLabel, true);
        scatterExamples.setAreaStyle(editOptions.areaStyle);


        echartFactory.setOption(scatterChart, scatterExamples.chartOption);
      }

      function resize() {
        window.onresize = scatterChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function ScatterEditor(Dashboard) {
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
      // 获取dashboard集合
      $scope.visualization.options.dashboardsList = Dashboard.query();
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('scatterRenderer', ScatterRenderer);
  ngModule.directive('scatterEditor', ScatterEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<scatter-renderer options="visualization.options" query-result="queryResult"></scatter-renderer>';
    const editTemplate = '<scatter-editor options="visualization.options" query-result="queryResult"></scatter-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-scatter',
      name: '散点图',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}
