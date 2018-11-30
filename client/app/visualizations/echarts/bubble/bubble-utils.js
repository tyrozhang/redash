import { each, uniq, max } from 'lodash';


function ChartDataHelper() {
  let xValueColumn;
  let yValueColumns;
  let queryResult;
  let groupingColumn;
  let namesColumn;

  ChartDataHelper.prototype.init = (result, xAxis, yAxis, groupColumn, nameColumn) => {
    xValueColumn = xAxis;
    groupingColumn = groupColumn;
    yValueColumns = yAxis;
    queryResult = result;
    namesColumn = nameColumn;
  };

  ChartDataHelper.prototype.getGroupingData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[groupingColumn]);
    });
    return uniq(data);
  };

  ChartDataHelper.prototype.getBubbleData = () => {
    if (groupingColumn) {
      const allGroupData = [];
      each(ChartDataHelper.prototype.getGroupingData(), (groupItem) => {
        const oneGroupData = [];
        each(queryResult, (item) => {
          if (item[groupingColumn] === groupItem) {
            oneGroupData.push([item[xValueColumn], item[yValueColumns], item[namesColumn], item[groupingColumn]]);
          }
        });
        allGroupData.push(oneGroupData);
      });
      return allGroupData;
    }
    const allData = [[]];
    each(queryResult, (item) => {
      allData[0].push([item[xValueColumn], item[yValueColumns], item[namesColumn]]);
    });
    return allData;
  };
}

// 获取值列中的最大值，用于计算气泡大小
function getMaxValue(bubbleData) {
  const valueList = [];
  each(bubbleData, (item) => {
    each(item, (value) => {
      valueList.push(value[0]);
    });
  });
  return max(valueList);
}

function BubbleOption() {
  this.chartOption = {
    grid: {
      top: '60px',
      left: '50px',
      right: '50px',
      bottom: '50px',
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        show: true,
        type: 'cross',
      },
    },
    legend: {
      show: true,
      x: 'right',
      y: 'top',
      padding: [5, 20, 5, 5],
      orient: 'vertical',
    },
    xAxis: {},
    yAxis: {},
    series: [{
      data: [],
      type: 'scatter',
    }],
  };

  this.chartHelper = new ChartDataHelper();

  this.setLegend = (legend) => {
    this.chartOption.legend.data = legend ? this.chartHelper.getGroupingData() : [];
  };

  this.setBubbleData = () => {
    each(this.chartHelper.getBubbleData(), (item, index) => {
      this.chartOption.series[index] = {
        name: this.chartHelper.getGroupingData()[index],
        data: item,
        itemStyle: {
          opacity: 0.6,
        },
        type: 'scatter',
        // 此回调函数将生成不同大小的气泡
        symbolSize: (data) => {
          const maxValue = getMaxValue(this.chartHelper.getBubbleData());
          if (data[0] / (maxValue / 50) < 5) {
            return 5;
          }
          return data[0] / (maxValue / 50);
        },
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

export { BubbleOption, ChartDataHelper };
