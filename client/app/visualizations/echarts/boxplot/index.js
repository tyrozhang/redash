import _ from 'lodash';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import chartIcon from '@/assets/images/visualizationIcons/icon_boxplot.png';
import BoxPlotOption from './boxplot-utils';
import editorTemplate from './boxplot-editor.html';

function echartsBoxPlotRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="echarts-chart-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.echarts-chart-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const boxplotChart = echartFactory.createChart(container);
      const initEditOptions = $scope.visualization.options.editOptions;

      _.each(document.getElementsByClassName('box-plot-input'), (inputs, bindex) => {
        inputs.value = initEditOptions.inputValues[bindex];
      });

      function reloadData() {
        const data = $scope.queryResult.getData();
        const editOptions = $scope.visualization.options.editOptions;
        const boxPlotExamples = new BoxPlotOption();
        if (!editOptions.inputValues) {
          editOptions.inputValues = {};
        }
        if (editOptions.valueColumns.length > 0) {
          _.each(document.getElementsByClassName('box-plot-input'), (inputs, bindex) => {
            editOptions.inputValues[bindex] = inputs.value;
          });
          boxPlotExamples.chartOption.result = data;
          boxPlotExamples.chartHelper.init(data, editOptions.valueColumns);
          boxPlotExamples.setBoxPlotData();
          boxPlotExamples.setXAxisLabel(editOptions.inputValues);
        } else {
          editOptions.inputValues = {};
          boxPlotExamples.clearXAxisLabel();
        }
        echartFactory.setOption(boxplotChart, boxPlotExamples.chartOption);
      }

      function resize() {
        window.onresize = boxplotChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function echartsBoxPlotEditor() {
  return {
    restrict: 'E',
    template: editorTemplate,
    link($scope) {
      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('echartsBoxPlotRenderer', echartsBoxPlotRenderer);
  ngModule.directive('echartsBoxPlotEditor', echartsBoxPlotEditor);
  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<echarts-box-plot-renderer options="visualization.options" query-result="queryResult"></echarts-box-plot-renderer>';
    const editTemplate = '<echarts-box-plot-editor options="visualization.options" query-result="queryResult"></echarts-box-plot-editor>';

    VisualizationProvider.registerVisualization({
      type: 'echart-boxplot',
      name: '盒须图',
      icon: chartIcon,
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}

init.init = true;
