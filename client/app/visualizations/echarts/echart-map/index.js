import _ from 'lodash';
import 'echarts/map/js/china';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import { MapOption } from './map-utils';
import editorTemplate from './echart-map-editor.html';


function emapRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="echarts-map-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-map-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const mapChart = echartFactory.createChart(container);

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const mapExamples = new MapOption();

        mapExamples.chartDataHelper.init(data, editOptions.categoryColumn, editOptions.valueColumn);
        if (editOptions.categoryColumn && editOptions.valueColumn) mapExamples.setOptionData();

        echartFactory.setOption(mapChart, mapExamples.mapOption);
      }

      function resize() {
        window.onresize = mapChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function emapEditor() {
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
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('emapRenderer', emapRenderer);
  ngModule.directive('emapEditor', emapEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<emap-renderer options="visualization.options" query-result="queryResult"></emap-renderer>';
    const editTemplate = '<emap-editor options="visualization.options" query-result="queryResult"></emap-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-map',
      name: '中国地图',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}
