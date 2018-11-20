import numberFormat from 'underscore.string/numberFormat';
import { ColorPalette } from '@/visualizations/chart/plotly/utils';
import * as _ from 'lodash';

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
          // 第一组数据
          const digitalPanelList = $scope.visualization.options.digitalPanelList;

          $scope.firstStringPrefix = digitalPanelList[0].prefixContent;
          $scope.firstPrefixColor = digitalPanelList[0].prefixColor;
          $scope.firstPrefixNewLine = $scope.$eval(digitalPanelList[0].prefixNewLine);

          $scope.firstStringSuffix = digitalPanelList[0].suffixContent;
          $scope.firstSuffixColor = digitalPanelList[0].suffixColor;
          $scope.firstSuffixNewLine = $scope.$eval(digitalPanelList[0].suffixNewLine);

          const firstContentColName = digitalPanelList[0].contentColName;
          $scope.firstContentColor = digitalPanelList[0].contentColor;
          let firstContentValue = queryData[0][firstContentColName];

          // 如果选择的内容值是数字，然后就根据选择保留的小数位数进行格式化内容
          if (_.isNumber(firstContentValue)) {
            const firstStringDecimal = digitalPanelList[0].contentDecimal;
            if (firstStringDecimal) {
              firstContentValue = numberFormat(firstContentValue, firstStringDecimal, '', '');
            }
          }
          $scope.firstContentValue = firstContentValue;

          // 第二组数据
          $scope.secondStringPrefix = digitalPanelList[1].prefixContent;
          $scope.secondPrefixColor = digitalPanelList[1].prefixColor;
          $scope.secondPrefixNewLine = $scope.$eval(digitalPanelList[1].prefixNewLine);

          $scope.secondStringSuffix = digitalPanelList[1].suffixContent;
          $scope.secondSuffixColor = digitalPanelList[1].suffixColor;
          $scope.secondSuffixNewLine = $scope.$eval(digitalPanelList[1].suffixNewLine);

          const secondContentColName = digitalPanelList[1].contentColName;
          $scope.secondContentColor = digitalPanelList[1].contentColor;
          let secondContentValue = queryData[0][secondContentColName];

          // 如果选择的内容值是数字，然后就根据选择保留的小数位数进行格式化内容
          if (_.isNumber(secondContentValue)) {
            const secondStringDecimal = digitalPanelList[1].contentDecimal;
            if (secondStringDecimal) {
              secondContentValue = numberFormat(secondContentValue, secondStringDecimal, '', '');
            }
          }
          $scope.secondContentValue = secondContentValue;
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
          object.prefixNewLine = 'false';
          object.contentColName = '';
          object.contentColor = '';
          object.contentDecimal = 0;
          object.suffixContent = '';
          object.suffixColor = '';
          object.suffixNewLine = 'false';

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
      renderTemplate,
      editorTemplate: editTemplate,
      defaultOptions,
    });
  });
}
