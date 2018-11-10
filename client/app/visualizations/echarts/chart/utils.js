import { each, uniq, values } from 'lodash';


function ChartHelper() {
  let categoryColumn;
  let groupingColumn;
  let valuesColumns;
  let queryResult;
  ChartHelper.prototype.init = (result, Xaxis, Yaxis, groupColumn) => {
    categoryColumn = Xaxis;
    groupingColumn = groupColumn;
    valuesColumns = Yaxis;
    queryResult = result;
  };

  // 提取分类内容
  ChartHelper.prototype.getCategoryData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[categoryColumn]);
    });
    return uniq(data);
  };

  // 提取分组内容
  ChartHelper.prototype.getGroupingData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[groupingColumn]);
    });
    return uniq(data);
  };

  ChartHelper.prototype.getValueData = () => {
    if (groupingColumn) {
      const allGroupData = {};
      each(ChartHelper.prototype.getGroupingData(), (groupingDataItem) => {
        const oneGroupData = {};
        each(ChartHelper.prototype.getCategoryData(), (categoryDataItem) => {
          oneGroupData[categoryDataItem + groupingDataItem] = 0;
        });
        allGroupData[groupingDataItem] = oneGroupData;
      });

      each(queryResult, (item) => {
        allGroupData[item[groupingColumn]][item[categoryColumn] + item[groupingColumn]] = item[valuesColumns[0]];
      });
      // allGroupData数据结构
      // "{女: {陕西宝鸡女: 30, 陕西汉中女: 30.5, 陕西渭南女: 29.5, 陕西西安女: 0}," +
      // "男: {陕西宝鸡男: 28.125, 陕西汉中男: 29.727272727272727, 陕西渭南男: 22.25, 陕西西安男: 19}}"
      const result1 = [];
      each(values(allGroupData), (item) => {
        result1.push(values(item));
      });
      return result1;
    }

    if (valuesColumns.length > 0) {
      const allGroupData = [];
      each(valuesColumns, (valuesColumnsItem) => {
        const oneGroupData = {};
        each(ChartHelper.prototype.getCategoryData(), (categoryDataItem) => {
          each(queryResult, (item) => {
            if (item[categoryColumn] === categoryDataItem) {
              oneGroupData[categoryDataItem] = item[valuesColumnsItem];
            }
          });
        });
        allGroupData.push(values(oneGroupData));
      });
      return allGroupData;
    }
    return [];
  };
}


export function PrepareChartOption() {
  PrepareChartOption.prototype.chartOption = {
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
    title: {
      text: '',
      center: 'center',
    },
    xAxis: {
      type: 'category',
      data: [],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [],
        type: 'bar',
      },
    ],
  };

  PrepareChartOption.prototype.chartHelper = new ChartHelper();

  // 根据X,Y轴的类型(类型列或值列)来设置xAxis/yAxis的data
  PrepareChartOption.prototype.setAxisData = () => {
    if (this.chartOption.xAxis.type === 'category') {
      this.chartOption.xAxis.data = this.chartHelper.getCategoryData();
    }
    if (this.chartOption.yAxis.type === 'category') {
      this.chartOption.yAxis.data = this.chartHelper.getCategoryData();
    }
  };

  // 设置是否展示图例
  PrepareChartOption.prototype.hasLegend = (hasLegend) => {
    const chartGroups =
      this.chartOption.groupByColumn ? this.chartHelper.getGroupingData() : this.chartOption.valueColumns;
    this.chartOption.legend.data = hasLegend ? chartGroups : [];
  };

  // 设置值列的最大值
  PrepareChartOption.prototype.setValueMax = (max) => {
    if (this.chartOption.xAxis.type === 'category') {
      this.chartOption.yAxis.max = max;
    } else {
      this.chartOption.xAxis.max = max;
    }
  };

  // 设置值列的最小值
  PrepareChartOption.prototype.setValueMin = (min) => {
    if (this.chartOption.yAxis.type === 'category') {
      this.chartOption.xAxis.min = min;
    } else {
      this.chartOption.yAxis.min = min;
    }
  };

  // 设置图形series.data的值
  PrepareChartOption.prototype.setSeriesData = (chartType) => {
    each(this.chartOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.chartOption.valueColumns, (item, index) => {
      this.chartOption.series[index] = {
        name: item,
        data: this.chartHelper.getValueData()[index],
        type: chartType,
      };
    });
  };

  // 开始向echarts的Option中添加数据
  PrepareChartOption.prototype.prepareData = (chart, data, editOptions) => {
    chart.chartOption.categoryColumn = editOptions.Xaxis;
    chart.chartOption.valueColumns = editOptions.Yaxis;
    chart.chartOption.result = data;
    chart.chartOption.groupByColumn = editOptions.groupby;
    chart.chartHelper.init(data, editOptions.Xaxis, editOptions.Yaxis, editOptions.groupby);
    chart.setAxisData();
    chart.hasLegend(editOptions.legend);
    chart.setValueMax(editOptions.rangeMax);
    chart.setValueMin(editOptions.rangeMin);
    chart.chartOption.xAxis.name = editOptions.xName;
    chart.chartOption.yAxis.name = editOptions.yName;
  };
}

const circlePosition = [
  // 0
  [['50%', '50%']],
  // 1
  [
    ['30%', '50%'],
    ['70%', '50%'],
  ],
  // 2
  [
    ['30%', '25%'],
    ['70%', '25%'],
    ['30%', '75%'],
  ],
  // 3
  [
    ['30%', '25%'],
    ['70%', '25%'],
    ['30%', '75%'],
    ['70%', '75%']],
];
const circleSize = [
  '60%', '40%', '30%', '30%',
];

export function PreparePieOption() {
  PreparePieOption.prototype.pieOption = {
    title: {
      text: '',
      x: 'center',
      y: '90%',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      data: [],
    },
    series: [
      {
        type: 'pie',
        selectedMode: 'single',
        selectedOffset: 30,
        label: {
          show: true,
        },
        data: [],
        itemStyle: {
          emphasis: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };

  PreparePieOption.prototype.chartHelper = new ChartHelper();

  PreparePieOption.prototype.hasLegend = (hasLegend) => {
    this.pieOption.legend.data = hasLegend ? this.chartHelper.getCategoryData() : [];
  };

  PreparePieOption.prototype.setPieSeriesData = () => {
    const getChartGroup = this.pieOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.pieOption.valueColumns;
    each(getChartGroup, (item, index) => {
      // 初始化饼图参数的内容
      this.pieOption.series[index] = {
        type: 'pie',
        data: [],
        center: ['50%', '50%'],
        radius: '60%',
      };
      // 将键值对的值添加到每组series.data中
      const dataValue = [];
      each(this.chartHelper.getCategoryData(), (onItem, onIndex) => {
        dataValue.push({
          name: this.chartHelper.getCategoryData()[onIndex],
          value: this.chartHelper.getValueData()[index][onIndex],
        });
      });
      this.pieOption.legend.data.push(this.chartHelper.getCategoryData()[index]);
      this.pieOption.series[index].data = dataValue;
    });
    // 根据饼图的个数设置每个饼图的位置和大小
    each(getChartGroup, (item, index) => {
      const groupLength = getChartGroup.length - 1;
      this.pieOption.series[index].center = circlePosition[groupLength][index];
      this.pieOption.series[index].radius = circleSize[groupLength];
    });
  };
}
