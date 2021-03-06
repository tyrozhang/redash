import { each, uniq, values } from 'lodash';

function ChartHelper() {
  let categoryColumn;
  let groupingColumn;
  let valuesColumns;
  let queryResult;
  ChartHelper.prototype.init = (result, categoryCol, valueCol, groupColumn) => {
    categoryColumn = categoryCol;
    groupingColumn = groupColumn;
    valuesColumns = valueCol;
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

function PieOption() {
  this.pieOption = {
    title: [],
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'right',
      padding: [10, 10, 5, 5],
      data: [],
    },
    series: [
      {
        type: 'pie',
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

  // 多圆情况下的圆的标题位置
  const circleTitleX = [
    // 1
    [],
    ['30%', '70%'],
    ['30%', '70%', '30%'],
    ['30%', '70%', '30%', '70%'],
    ['20%', '50%', '80%', '20%', '50%'],
    ['20%', '50%', '80%', '20%', '50%', '80%'],
  ];
  const circleTitleY = [
    // 1
    [],
    ['75%', '75%'],
    ['45%', '45%', '95%'],
    ['45%', '45%', '95%', '95%'],
    ['43%', '43%', '43%', '93%', '93%'],
    ['43%', '43%', '43%', '93%', '93%', '93%'],
  ];

  // 根据圆的数量定义各个圆的位置
  const circleCenter = [
    // 1
    [['50%', '50%']],
    // 2
    [['30%', '50%'],
      ['70%', '50%']],
    // 3
    [['30%', '25%'],
      ['70%', '25%'],
      ['30%', '75%']],
    // 4
    [['30%', '25%'],
      ['70%', '25%'],
      ['30%', '75%'],
      ['70%', '75%']],
    // 5
    [['20%', '25%'],
      ['50%', '25%'],
      ['80%', '25%'],
      ['20%', '75%'],
      ['50%', '75%']],
    // 6
    [['20%', '25%'],
      ['50%', '25%'],
      ['80%', '25%'],
      ['20%', '75%'],
      ['50%', '75%'],
      ['80%', '75%']],
  ];
  // 根据圆的数量定义各个圆的大小
  const circleRadius = [
    '70%', '40%', '35%', '35%', '30%', '30%',
  ];
  // 圆环图空白圆的大小
  const circleDoughnutRadius = [
    '50%', '20%', '15%', '15%', '10%', '10%',
  ];

  this.chartHelper = new ChartHelper();

  // 设置是否展示图例
  this.setLegend = (legend) => {
    this.pieOption.legend.data = legend ? this.chartHelper.getCategoryData() : [];
  };

  // 设置多饼图时的名称
  this.setPieTitle = () => {
    const getChartGroup = this.pieOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.pieOption.valueColumns;
    const labelX = circleTitleX[getChartGroup.length - 1];
    const labelY = circleTitleY[getChartGroup.length - 1];
    if (getChartGroup.length > 1) {
      each(getChartGroup, (item, index) => {
        this.pieOption.title[index] = {
          text: item,
          textAlign: 'center',
          x: labelX[index],
          y: labelY[index],
          textStyle: {
            fontWeight: 'normal',
            fontSize: 12,
          },
        };
      });
    }
  };

  // 设置图形series.data的值
  this.setPieSeriesData = () => {
    const getChartGroup = this.pieOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.pieOption.valueColumns;
    each(getChartGroup, (item, index) => {
      // 初始化饼图参数的内容
      this.pieOption.series[index] = {
        name: '',
        type: 'pie',
        data: [],
        center: ['50%', '50%'],
        radius: '60%',
        label: {
          show: true,
        },
        labelLine: {
          length: 10,
          length2: 10,
        },
        selectedMode: 'single',
        selectedOffset: 20,
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
      this.pieOption.series[index].name = item;
      this.pieOption.series[index].data = dataValue;
    });
    // 根据饼图的个数设置每个饼图的位置和大小
    if (getChartGroup) {
      const pieCenter = circleCenter[getChartGroup.length - 1];
      const pieRadius = circleRadius[getChartGroup.length - 1];
      each(getChartGroup, (item, index) => {
        this.pieOption.series[index].center = pieCenter[index];
        this.pieOption.series[index].radius = pieRadius;
      });
    }
  };

  // 是否将饼图切换为南丁格尔图
  this.setRoseType = (roseType) => {
    const getChartGroup = this.pieOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.pieOption.valueColumns;
    each(getChartGroup, (item, index) => {
      if (roseType) {
        this.pieOption.series[index].roseType = 'radius';
        this.pieOption.series[index].radius = ['10%', circleRadius[getChartGroup.length - 1]];
      } else {
        this.pieOption.series[index].roseType = false;
        this.pieOption.series[index].radius = circleRadius[getChartGroup.length - 1];
      }
    });
  };

  // 是否将饼图切换为环图
  this.setDoughnut = (isDoughnut) => {
    const getChartGroup = this.pieOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.pieOption.valueColumns;
    each(getChartGroup, (item, index) => {
      if (isDoughnut) {
        this.pieOption.series[index]
          .radius = [circleDoughnutRadius[getChartGroup.length - 1], circleRadius[getChartGroup.length - 1]];
      } else {
        this.pieOption.series[index].radius = circleRadius[getChartGroup.length - 1];
      }
    });
  };

  // 是否在饼图上显示标签
  this.setPieLabel = (pieLabel) => {
    const getChartGroup = this.pieOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.pieOption.valueColumns;
    each(getChartGroup, (item, index) => {
      this.pieOption.series[index].label.show = pieLabel;
    });
  };
}

export default PieOption;
