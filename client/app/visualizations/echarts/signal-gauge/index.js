import _ from 'lodash';
import { ColorPalette } from '@/visualizations/chart/plotly/utils';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import editorTemplate from './signal-gauge-editor.html';


// 单仪表盘的绘图参数
const gaugeOption = {
  grid: {
    top: '0px',
    left: '0px',
    right: '0px',
    bottom: '0px',
  },
  tooltip: {
    formatter: '{b} : {c}',
  },
  series: [
    {
      radius: '100%',
      center: ['50%', '57%'],
      type: 'gauge',
      detail: {
        formatter: '{value}',
      },
      title: {
        color: '#72ACD1',
      },
      data: [
        { value: [], name: '仪表盘' },
      ],
      max: 100,
      axisLine: {
        lineStyle: {
          color: [
            [0.3, ''],
            [0.7, ''],
            [1, ''],
          ],
        },
      },
    },
  ],
};


function signalGaugeRenderer($location, currentUser) {
  return {
    restrict: 'E',
    template: '<div class="signal-gauge-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.signal-gauge-visualization-container');
      const echartFactory = new EchartsFactory($location, currentUser);
      const gaugeChart = echartFactory.createChart(container);

      function reloadData() {
        const queryData = $scope.queryResult.getData();

        if (queryData) {
          const gaugeLabel = $scope.visualization.options.editOptions.gaugeLabel;
          const column = $scope.visualization.options.editOptions.columnName;
          const maxNumber = $scope.visualization.options.editOptions.maxNumber;
          const colorLeft = $scope.visualization.options.editOptions.colors[0];
          const colorCenter = $scope.visualization.options.editOptions.colors[1];
          const colorRight = $scope.visualization.options.editOptions.colors[2];

          // 根据选择的列显示第一行数据
          gaugeOption.series[0].data[0].value = queryData[0][column];

          // 仪表盘标题的设置
          gaugeOption.series[0].data[0].name = gaugeLabel;

          // 最大值的参数设置
          gaugeOption.series[0].max = maxNumber;

          // 颜色的参数设置
          gaugeOption.series[0].axisLine.lineStyle.color[0][1] = colorLeft;
          gaugeOption.series[0].axisLine.lineStyle.color[1][1] = colorCenter;
          gaugeOption.series[0].axisLine.lineStyle.color[2][1] = colorRight;

          echartFactory.setOption(gaugeChart, gaugeOption);
        }
      }

      // window.onresize监听div和屏幕的改变，gaugeChart.resize改变图表尺寸，在容器大小发生改变时需要手动调用
      function resize() {
        window.onresize = gaugeChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);
      $scope.$watch('visualization.options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },

  };
}

function signalGaugeEditor() {
  return {
    restrict: 'E',
    template: editorTemplate,
    link($scope) {
      const editOptions = {
        columnName: '',
        gaugeLabel: '仪表盘',
        maxNumber: 100,
        // colors: ['#3BD973', '#356AFF', '#E92828'],
        colors: ['#20604F', '#f09426', '#D0104C'],
      };

      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;
      $scope.visualization.options.colors = ColorPalette;
      $scope.sectorLabels = ['左侧区域颜色', '中间区域颜色', '右侧区域颜色'];
    },
  };
}


export default function init(ngModule) {
  ngModule.directive('signalGaugeRenderer', signalGaugeRenderer);
  ngModule.directive('signalGaugeEditor', signalGaugeEditor);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<signal-gauge-renderer></signal-gauge-renderer>';
    const editTemplate = '<signal-gauge-editor></signal-gauge-editor>';

    VisualizationProvider.registerVisualization({
      type: 'signal-gauge',
      name: '单仪表盘',
      renderTemplate,
      editorTemplate: editTemplate,
    });
  });
}

init.init = true;
