import { each, uniq } from 'lodash';
import config from '@/visualizations/echarts/config';


function ChartHelper() {
  let categoryColumn;
  let valuesColumns;
  let queryResult;
  let groupingColumn;
  let namesColumn;

  ChartHelper.prototype.init = (result, xAxis, yAxis, groupColumn, nameColumn) => {
    categoryColumn = xAxis;
    groupingColumn = groupColumn;
    valuesColumns = yAxis;
    queryResult = result;
    namesColumn = nameColumn;
  };

  ChartHelper.prototype.getGroupingData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[groupingColumn]);
    });
    return uniq(data);
  };

  ChartHelper.prototype.getScatterData = () => {
    if (groupingColumn) {
      const allGroupData = [];
      each(ChartHelper.prototype.getGroupingData(), (groupItem) => {
        const oneGroupData = [];
        each(queryResult, (item) => {
          if (item[groupingColumn] === groupItem) {
            oneGroupData.push([item[categoryColumn], item[valuesColumns], item[namesColumn], item[groupingColumn]]);
          }
        });
        allGroupData.push(oneGroupData);
      });
      return allGroupData;
    }
    const allData = [[]];
    each(queryResult, (item) => {
      allData[0].push([item[categoryColumn], item[valuesColumns], item[namesColumn]]);
    });
    return allData;
  };
}

function ScatterOption() {
  this.chartOption = {
    color: config.defaultColors,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#283b56',
        },
      },
    },
    legend: {
      show: true,
      x: 'right',
      y: 'top',
      orient: 'vertical',
    },
    xAxis: {},
    yAxis: {},
    series: [{
      data: [],
      type: 'scatter',
    }],
  };

  this.chartHelper = new ChartHelper();

  this.setLegend = (legend) => {
    this.chartOption.legend.data = legend ? this.chartHelper.getGroupingData() : [];
  };

  this.setScatterData = () => {
    each(this.chartHelper.getScatterData(), (item, index) => {
      this.chartOption.series[index] = {
        name: this.chartHelper.getGroupingData()[index],
        data: item,
        type: 'scatter',
        label: {
          emphasis: {
            show: true,
            formatter: param => param.data[2],
            position: 'top',
          },
        },
      };
    });
  };
}

export { ScatterOption, ChartHelper };
