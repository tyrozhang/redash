import _ from 'lodash';
import config from '@/visualizations/echarts/config';
import EchartsFactory from '@/lib/visualizations/echarts/echarts-factory';
import editorTemplate from './signal-gauge-editor.html';


function setGaugeColor(option, color) {
  option.series[0].axisLine = {
    lineStyle: {
      color: [
        [0.3, color[0]],
        [0.7, color[1]],
        [1, color[2]],
      ],
    },
  };
}

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

          // 根据选择的列显示第一行数据
          gaugeOption.series[0].data[0].value = queryData[0][column];

          // 仪表盘标题的设置
          gaugeOption.series[0].data[0].name = gaugeLabel;

          // 最大值的参数设置
          gaugeOption.series[0].max = maxNumber;

          // 颜色的参数设置
          setGaugeColor(gaugeOption, config.defaultColors);

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
      };

      if (!$scope.visualization.id) $scope.visualization.options.editOptions = editOptions;
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
