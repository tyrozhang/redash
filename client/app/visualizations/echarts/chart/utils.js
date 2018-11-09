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

export default function PrepareChartOption() {
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

  PrepareChartOption.prototype.pieOption = {
    title: {
      text: '',
      x: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: [],
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        selectedMode: 'single',
        selectedOffset: 30,
        label: {
          show: false,
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
      {
        type: 'pie',
        radius: '60%',
        center: ['75%', '50%'],
        label: {
          show: false,
        },
        data: [],
      },
    ],
  };

  PrepareChartOption.prototype.setCategoryColumn = (categoryColumn) => {
    this.chartOption.categoryColumn = categoryColumn;
  };

  PrepareChartOption.prototype.setxAxisType = (type) => {
    this.chartOption.xAxis.type = type;
  };

  PrepareChartOption.prototype.setyAxisType = (type) => {
    this.chartOption.yAxis.type = type;
  };

  PrepareChartOption.prototype.setGroupBy = (groupByColumn) => {
    this.chartOption.groupByColumn = groupByColumn;
  };

  PrepareChartOption.prototype.setValueColumns = (valueColumns) => {
    this.chartOption.valueColumns = valueColumns;
  };

  PrepareChartOption.prototype.setResult = (result) => {
    this.chartOption.result = result;
  };

  PrepareChartOption.prototype.chartHelper = new ChartHelper();

  PrepareChartOption.prototype.setAxisData = () => {
    if (this.chartOption.xAxis.type === 'category') {
      this.chartOption.xAxis.data = this.chartHelper.getCategoryData();
    }
    if (this.chartOption.yAxis.type === 'category') {
      this.chartOption.yAxis.data = this.chartHelper.getCategoryData();
    }
  };

  PrepareChartOption.prototype.hasLegend = (hasLegend) => {
    const chartGroups =
      this.chartOption.groupByColumn ? this.chartHelper.getGroupingData() : this.chartOption.valueColumns;
    this.chartOption.legend.data = hasLegend ? chartGroups : [];
  };

  PrepareChartOption.prototype.setValueMax = (max) => {
    if (this.chartOption.xAxis.type === 'category') {
      this.chartOption.yAxis.max = max;
    } else {
      this.chartOption.xAxis.max = max;
    }
  };

  PrepareChartOption.prototype.setValueMin = (min) => {
    if (this.chartOption.yAxis.type === 'category') {
      this.chartOption.xAxis.min = min;
    } else {
      this.chartOption.yAxis.min = min;
    }
  };

  PrepareChartOption.prototype.setXLabel = (xName) => {
    this.chartOption.xAxis.name = xName;
  };

  PrepareChartOption.prototype.setYLabel = (yName) => {
    this.chartOption.yAxis.name = yName;
  };
}
PrepareChartOption.prototype.setBarLineSeriesData = (chartType) => {
  const chartOption = PrepareChartOption.prototype.chartOption;
  const chartGroups = chartOption.groupByColumn
    ? PrepareChartOption.prototype.chartHelper.getGroupingData() :
    chartOption.valueColumns;

  each(chartGroups, (item, index) => {
    chartOption.series[index] = {
      name: item,
      data: PrepareChartOption.prototype.chartHelper.getValueData()[index],
      type: chartType,
    };
  });
};

PrepareChartOption.prototype.setPieSeriesData = () => {
  const chartOption = PrepareChartOption.prototype.chartOption;
  const chartGroups = chartOption.groupByColumn
    ? PrepareChartOption.prototype.chartHelper.getGroupingData() :
    chartOption.valueColumns;

  each(chartGroups, (item, index) => {
    chartOption.series[index] = {
      name: item,
      data: PrepareChartOption.prototype.chartHelper.getValueData()[index],
      type: 'pie',
    };
  });
};

