import {
  some, extend, defaults, has, partial, intersection, without, includes, isUndefined,
  sortBy, each, map, keys, difference,
} from 'lodash';
// import Bar from '@/lib/visualizations/echarts/bar-tick-align';
import * as echarts from 'echarts';
import editorTemplate from './editor.html';

const DEFAULT_OPTIONS = {
  globalSeriesType: 'column',
  sortX: true,
  legend: { enabled: true },
  yAxis: [{ type: 'linear' }, { type: 'linear', opposite: true }],
  xAxis: { type: '-', labels: { enabled: true } },
  error_y: { type: 'data', visible: true },
  series: { stacking: null, error_y: { type: 'data', visible: true } },
  seriesOptions: {},
  valuesOptions: {},
  columnMapping: {},

  // showDataLabels: false, // depends on chart type
  numberFormat: '0,0[.]00000',
  percentFormat: '0[.]00%',
  // dateTimeFormat: 'DD/MM/YYYY HH:mm', // will be set from clientConfig
  textFormat: '', // default: combination of {{ @@yPercent }} ({{ @@y }} ± {{ @@yError }})

  defaultColumns: 3,
  defaultRows: 8,
  minColumns: 1,
  minRows: 5,
};
function barTickAlignRenderer() {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      options: '=?',
    },
    replace: false,
    template: '<div class="sunburst-visualization-container"></div>',
    link($scope, element) {
      const container = element[0].querySelector('.sunburst-visualization-container');
      // Bar($scope, container);
      const myChart = echarts.init(container);
      const option = {
        color: ['#3398DB'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [{
          data: [],
          type: 'bar',
        }],
      };

      let data = [];

      function reloadData() {
        if (!isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
          const xAxisData = [];
          const seriesData = [];
          data = $scope.queryResult.getChartData($scope.options.columnMapping);
          // data is not empty
          if (data.length > 0) {
            each(data[0].data, (point) => {
              xAxisData.push(point.x);
              seriesData.push(point.y);
            });
            option.xAxis.data = xAxisData;
            option.series[0].data = seriesData;
            myChart.setOption(option);
          }
        }
      }

      $scope.$watch('options', reloadData, true);
      $scope.$watch('queryResult && queryResult.getData()', reloadData);
    },
  };
}

function barTickAlignEditor(ColorPalette, clientConfig) {
  return {
    restrict: 'E',
    template: editorTemplate,
    scope: {
      queryResult: '=',
      options: '=?',
    },
    link(scope) {
      scope.currentTab = 'general';
      scope.colors = extend({ 自动: null }, ColorPalette);

      scope.stackingOptions = {
        禁用: null,
        堆叠: 'stack',
      };

      scope.changeTab = (tab) => {
        scope.currentTab = tab;
      };

      scope.chartTypes = {
        line: { name: '线形图', icon: 'line-chart' },
        column: { name: '柱状图', icon: 'bar-chart' },
        area: { name: '面积图', icon: 'area-chart' },
        pie: { name: '饼图', icon: 'pie-chart' },
        scatter: { name: '散点图', icon: 'circle-o' },
        bubble: { name: '气泡图', icon: 'circle-o' },
        box: { name: '盒形图', icon: 'square-o' },
      };

      if (clientConfig.allowCustomJSVisualizations) {
        scope.chartTypes.custom = { name: 'Custom', icon: 'code' };
      }

      scope.xAxisScales = [
        { label: '自动检测', value: '-' },
        { label: '时间', value: 'datetime' },
        { label: '线性', value: 'linear' },
        { label: '对数', value: 'logarithmic' },
        { label: '分类', value: 'category' },
      ];
      scope.yAxisScales = ['线性', '对数', '时间', '分类'];

      scope.chartTypeChanged = () => {
        keys(scope.options.seriesOptions).forEach((key) => {
          scope.options.seriesOptions[key].type = scope.options.globalSeriesType;
        });
        scope.options.showDataLabels = scope.options.globalSeriesType === 'pie';
        scope.$applyAsync();
      };

      scope.showSizeColumnPicker = () => some(scope.options.seriesOptions, options => options.type === 'bubble');

      if (scope.options.customCode === undefined) {
        scope.options.customCode = `// Available variables are x, ys, element, and Plotly
// Type console.log(x, ys); for more info about x and ys
// To plot your graph call Plotly.plot(element, ...)
// Plotly examples and docs: https://plot.ly/javascript/`;
      }

      function refreshColumns() {
        scope.columns = scope.queryResult.getColumns();
        scope.columnNames = map(scope.columns, i => i.name);
        if (scope.columnNames.length > 0) {
          each(difference(keys(scope.options.columnMapping), scope.columnNames), (column) => {
            delete scope.options.columnMapping[column];
          });
        }
      }

      function refreshColumnsAndForm() {
        refreshColumns();
        if (!scope.queryResult.getData() ||
            scope.queryResult.getData().length === 0 ||
            scope.columns.length === 0) {
          return;
        }
        scope.form.yAxisColumns = intersection(scope.form.yAxisColumns, scope.columnNames);
        if (!includes(scope.columnNames, scope.form.xAxisColumn)) {
          scope.form.xAxisColumn = undefined;
        }
        if (!includes(scope.columnNames, scope.form.groupby)) {
          scope.form.groupby = undefined;
        }
      }

      function refreshSeries() {
        const chartData = scope.queryResult.getChartData(scope.options.columnMapping);
        const seriesNames = map(chartData, i => i.name);
        const existing = keys(scope.options.seriesOptions);
        each(difference(seriesNames, existing), (name) => {
          scope.options.seriesOptions[name] = {
            type: scope.options.globalSeriesType,
            yAxis: 0,
          };
          scope.form.seriesList.push(name);
        });
        each(difference(existing, seriesNames), (name) => {
          scope.form.seriesList = without(scope.form.seriesList, name);
          delete scope.options.seriesOptions[name];
        });

        if (scope.options.globalSeriesType === 'pie') {
          const uniqueValuesNames = new Set();
          each(chartData, (series) => {
            each(series.data, (row) => {
              uniqueValuesNames.add(row.x);
            });
          });
          const valuesNames = [];
          uniqueValuesNames.forEach(v => valuesNames.push(v));

          // initialize newly added values
          const newValues = difference(valuesNames, keys(scope.options.valuesOptions));
          each(newValues, (name) => {
            scope.options.valuesOptions[name] = {};
            scope.form.valuesList.push(name);
          });
          // remove settings for values that are no longer available
          each(keys(scope.options.valuesOptions), (name) => {
            if (valuesNames.indexOf(name) === -1) {
              delete scope.options.valuesOptions[name];
            }
          });
          scope.form.valuesList = intersection(scope.form.valuesList, valuesNames);
        }
      }

      function setColumnRole(role, column) {
        scope.options.columnMapping[column] = role;
      }

      function unsetColumn(column) {
        setColumnRole('unused', column);
      }

      refreshColumns();

      scope.$watch('options.columnMapping', () => {
        if (scope.queryResult.status === 'done') {
          refreshSeries();
        }
      }, true);

      scope.$watch(() => [scope.queryResult.getId(), scope.queryResult.status], (changed) => {
        if (!changed[0] || changed[1] !== 'done') {
          return;
        }

        refreshColumnsAndForm();
        refreshSeries();
      }, true);

      scope.form = {
        yAxisColumns: [],
        seriesList: sortBy(keys(scope.options.seriesOptions), name =>
          scope.options.seriesOptions[name].zIndex),
        valuesList: keys(scope.options.valuesOptions),
      };

      scope.$watchCollection('form.seriesList', (value) => {
        each(value, (name, index) => {
          scope.options.seriesOptions[name].zIndex = index;
          scope.options.seriesOptions[name].index = 0; // is this needed?
        });
      });


      scope.$watchCollection('form.yAxisColumns', (value, old) => {
        each(old, unsetColumn);
        each(value, partial(setColumnRole, 'y'));
      });

      scope.$watch('form.xAxisColumn', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) { setColumnRole('x', value); }
      });

      scope.$watch('form.errorColumn', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) {
          setColumnRole('yError', value);
        }
      });

      scope.$watch('form.sizeColumn', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) {
          setColumnRole('size', value);
        }
      });


      scope.$watch('form.groupby', (value, old) => {
        if (old !== undefined) {
          unsetColumn(old);
        }
        if (value !== undefined) {
          setColumnRole('series', value);
        }
      });

      if (!has(scope.options, 'legend')) {
        scope.options.legend = { enabled: true };
      }

      if (scope.columnNames) {
        each(scope.options.columnMapping, (value, key) => {
          if (scope.columnNames.length > 0 && !includes(scope.columnNames, key)) {
            return;
          }
          if (value === 'x') {
            scope.form.xAxisColumn = key;
          } else if (value === 'y') {
            scope.form.yAxisColumns.push(key);
          } else if (value === 'series') {
            scope.form.groupby = key;
          } else if (value === 'yError') {
            scope.form.errorColumn = key;
          } else if (value === 'size') {
            scope.form.sizeColumn = key;
          }
        });
      }

      function setOptionsDefaults() {
        if (scope.options) {
          // For existing visualization - set default options
          defaults(scope.options, extend({}, DEFAULT_OPTIONS, {
            showDataLabels: scope.options.globalSeriesType === 'pie',
            dateTimeFormat: clientConfig.dateTimeFormat,
          }));
        }
      }
      setOptionsDefaults();
      scope.$watch('options', setOptionsDefaults);

      scope.templateHint = `
        <div class="p-b-5">Use special names to access additional properties:</div>
        <div><code>{{ @@name }}</code> series name;</div>
        <div><code>{{ @@x }}</code> x-value;</div>       
        <div><code>{{ @@y }}</code> y-value;</div>
        <div><code>{{ @@yPercent }}</code> relative y-value;</div>
        <div><code>{{ @@yError }}</code> y deviation;</div>       
        <div><code>{{ @@size }}</code> bubble size;</div>       
        <div class="p-t-5">Also, all query result columns can be referenced using 
          <code class="text-nowrap">{{ column_name }}</code> syntax.</div>       
      `;
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('barTickAlignRenderer', barTickAlignRenderer);
  ngModule.directive('barTickAlignEditor', barTickAlignEditor);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate = '<bar-tick-align-renderer options="visualization.options" query-result="queryResult"></bar-tick-align-renderer>';
    const barTickAlignRendererEditorTemplate = '<bar-tick-align-editor options="visualization.options" query-result="queryResult"></bar-tick-align-editor>';
    VisualizationProvider.registerVisualization({
      type: 'bar',
      name: 'Echarts柱状图',
      renderTemplate,
      editorTemplate: barTickAlignRendererEditorTemplate,
      defaultOptions: DEFAULT_OPTIONS,
    });
  });
}
