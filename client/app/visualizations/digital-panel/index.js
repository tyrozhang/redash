import * as _ from 'lodash';
import numberFormat from 'underscore.string/numberFormat';
import { ColorPalette } from '@/visualizations/chart/plotly/utils';
import chartIcon from '@/assets/images/visualizationIcons/icon_counter.png';
import counterTemplate from './digital-panel.html';
import counterEditorTemplate from './digital-panel-editor.html';

function DigitalPanelRenderer() {
  return {
    restrict: 'E',
    template: counterTemplate,
    link($scope) {
      const refreshData = () => {
        const queryData = $scope.queryResult.getData();
        if (queryData) {
          $scope.digitalPanelList = $scope.visualization.options.digitalPanelList;

          // 根据保留的小数位数进行格式化展现内容。
          $scope.getContentValue = (digitalPanel) => {
            const firstContentColName = digitalPanel.contentColName;
            let firstContentValue = queryData[0][firstContentColName];

            // 如果选择的内容值是数字，然后就根据选择保留的小数位数进行格式化内容
            if (_.isNumber(firstContentValue)) {
              const firstStringDecimal = digitalPanel.contentDecimal;
              if (firstStringDecimal) {
                firstContentValue = numberFormat(firstContentValue, firstStringDecimal, '', '');
              }
            }
            return firstContentValue;
          };

          // 根据前后缀的位置，判断是否进行折行显示。
          $scope.isNewLine = (position) => {
            if (position === 'left' || position === 'right') {
              return false;
            }
            return true;
          };
        }
      };

      $scope.$watch('visualization.options', refreshData, true);
      $scope.$watch('queryResult && queryResult.getData()', refreshData);
    },
  };
}

function DigitalPanelEditor() {
  return {
    restrict: 'E',
    template: counterEditorTemplate,
    link($scope) {
      // 标签页切换
      $scope.currentTab = 'firstSet';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };

      // 颜色集合
      $scope.colors = ColorPalette;

      if (!$scope.visualization.id) {
        const digitalPanelList = [];

        _.each([0, 1], () => {
          const object = {};
          object.prefixContent = '';
          object.prefixColor = '';
          object.prefixPosition = 'left';
          object.contentColName = '';
          object.contentColor = '';
          object.contentDecimal = 0;
          object.suffixContent = '';
          object.suffixColor = '';
          object.suffixPosition = 'right';

          digitalPanelList.push(object);
        });

        $scope.visualization.options.digitalPanelList = digitalPanelList;
      }
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('digitalPanelEditor', DigitalPanelEditor);
  ngModule.directive('digitalPanelRenderer', DigitalPanelRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<digital-panel-renderer options="visualization.options" query-result="queryResult"></digital-panel-renderer>';
    const editTemplate = '<digital-panel-editor></digital-panel-editor>';

    const defaultOptions = {};

    VisualizationProvider.registerVisualization({
      type: 'digitalPanel',
      name: '计数器',
      icon: chartIcon,
      renderTemplate,
      editorTemplate: editTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
