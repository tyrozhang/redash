import * as echarts from 'echarts';
import _ from 'lodash';
import radarTemplate from './radar-editor.html';

const DEFAULT_OPTIONS = {};

// 雷达图的配置项
const option = {
  color: ['#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
  tooltip: {},
  legend: {
    data: [],
    left: '10px',
    top: '10px',
  },
  radar: {
    nameGap: 5,
    name: {
      textStyle: {
        color: '#72ACD1',
        padding: [3, 5],
      },
    },
    indicator: [],
  },
  series: [{
    type: 'radar',
    itemStyle: {
      normal: {
        areaStyle: {
          type: 'default',
        },
      },
    },
    data: [],
  }],
};

function radarRenderer() {
  return {
    restrict: 'E',
    scope: {
      options: '=',
      queryResult: '=',
    },
    replace: false,
    template: '<div class="radar-visualization-container" resize-event="handleResize()"></div>',
    link($scope, element) {
      // 根据类样式名得到用于展现Echarts图表展现的div的dom对象
      const container = element[0].querySelector('.radar-visualization-container');

      // 初始化echarts实例
      const myChart = echarts.init(container);

      // 定义一个数组，用于存储查询的结果集。
      let resultData = [];

      function reloadData() {
        if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
          // 得到查询的结果集
          resultData = $scope.queryResult.getData();

          const legendData = [];
          const seriesData = [];
          const radarIndicator = [];

          if (resultData.length > 0) {
            // 获取操作页面图表设置的列集合
            const columsList = $scope.options.columsList;

            /**
             * 遍历列集合，拼装option的radarIndicator(指示器)数组的数据。
             * PS(数据格式):[{name: '院校名气',max: 100,},{name: '学术氛围',max: 100,}...]
             */
            _.each(columsList, (colum) => {
              if (colum.type !== 'string') {
                // 默认别名取列名的值，当设置别名后，获取别名的值
                let alias = colum.name;
                if (colum.alias) {
                  alias = colum.alias;
                }
                const object = {};
                object.name = alias;
                object.max = colum.max;

                radarIndicator.push(object);
              }
            });

            /**
             * 根据colum的类型得到legendName（图例名）和seriesDataValueName（列系值对应的列名数组）
             */
            let legendName = '';
            const seriesDataValueName = [];
            _.each(columsList, (colum) => {
              if (colum.type === 'string') {
                legendName = colum.name;
              } else {
                seriesDataValueName.push(colum.name);
              }
            });

            /**
             * 遍历查询的结果集，根据legendName（图例名）和seriesDataValueName（列系值对应的列名数组）
             * 来组装legendData（图例值）和seriesData（列系值）
             */
            _.each(resultData, (obj) => {
              const seriesDataValue = [];
              _.each(seriesDataValueName, (name) => {
                seriesDataValue.push(obj[name]);
              });

              const object = {};
              object.name = obj[legendName];
              object.value = seriesDataValue;
              seriesData.push(object);

              legendData.push(obj[legendName]);
            });

            // 给option属性设置值
            option.legend.data = legendData;
            option.series[0].data = seriesData;
            option.radar.indicator = radarIndicator;
          }
        }
        // 使用配置项和数据显示图表
        myChart.setOption(option);
      }

      function resize() {
        // window.onresize监听div和屏幕的改变，myChart.resize改变图表尺寸，在容器大小发生改变时需要手动调用
        window.onresize = myChart.resize;
      }

      $scope.handleResize = _.debounce(resize, 50);

      $scope.$watch('options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function radarEditor() {
  return {
    restrict: 'E',
    template: radarTemplate,
    link($scope) {
      if (!$scope.visualization.options.columsList) {
        const columsList = [];

        // 获取根据查询结果得到的colums
        const columsData = $scope.queryResult.columns;

        /**
         * 遍历colums，然后组装成雷达图需要的colums
         */
        _.each(columsData, (colum) => {
          const object = {};
          object.type = colum.type;
          object.name = colum.name;
          object.alias = '';
          object.max = 100;

          columsList.push(object);
        });

        $scope.visualization.options.columsList = columsList;
      }
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('radarRenderer', radarRenderer);
  ngModule.directive('radarEditor', radarEditor);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<radar-renderer options="visualization.options" query-result="queryResult"></radar-renderer>';
    const radarEditorTemplate = '<radar-editor></radar-editor>';
    VisualizationProvider.registerVisualization({
      type: 'radar',
      name: '雷达图',
      renderTemplate,
      editorTemplate: radarEditorTemplate,
      defaultOptions: DEFAULT_OPTIONS,
    });
  });
}
