import { each, uniq, values, max } from 'lodash';


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

// 对轴文本进行判断，如果超过5个字将折行显示
function setAxisLabel(params) {
  if (params.length > 5) {
    let newParamsName = '';// 最终拼接成的字符串
    const paramsNameNumber = params.length;// 实际标签的长度
    const provideNumber = 5;// 每行能显示的字的长度
    const rowNumber = Math.ceil(paramsNameNumber / provideNumber);// 换行的话，需要显示几行，向上取整
    // 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
    if (paramsNameNumber > provideNumber) {
      // 循环每一行,p表示行
      for (let p = 0; p < rowNumber; p += 1) {
        // 表示每一次截取的字符串
        let tempStr = '';
        // 开始截取的位置
        const start = p * provideNumber;
        // 结束截取的位置
        const end = start + provideNumber;
        // 此处特殊处理最后一行的索引值
        if (p === rowNumber - 1) {
          // 最后一次不换行
          tempStr = params.substring(start, paramsNameNumber);
        } else {
          // 每一次拼接字符串并换行
          tempStr = params.substring(start, end) + '\n';
        }
        // 最终拼成的字符串
        newParamsName += tempStr;
      }
    } else {
      // 将旧标签的值赋给新标签
      newParamsName = params;
    }
    // 将最终的字符串返回
    return newParamsName;
  }
  return params;
}

function BaseChartOption() {
  this.chartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#283b56',
        },
      },
    },
    grid: {
      top: '40px',
      left: '60px',
      right: '60px',
      bottom: '40px',
    },
    legend: {
      show: true,
      x: 'right',
      y: 'top',
      padding: [10, 10, 5, 5],
      orient: 'vertical',
    },
    title: {
      text: '',
      center: 'center',
    },
    xAxis: {
      type: 'category',
      nameTextStyle: { fontWeight: 'bold', fontSize: 15 },
      data: [],
      axisLabel: {
        rotate: '',
      },
    },
    yAxis: {
      type: 'value',
      nameTextStyle: { fontWeight: 'bold', fontSize: 15 },
    },
    series: [
      {
        data: [],
        type: 'bar',
      },
    ],
  };

  this.chartHelper = new ChartHelper();

  // 根据X,Y轴的类型(类型列或值列)来设置xAxis/yAxis的data
  this.setCategoryData = () => {
    if (this.chartOption.xAxis.type === 'category') {
      this.chartOption.xAxis.data = this.chartHelper.getCategoryData();
    }
    if (this.chartOption.yAxis.type === 'category') {
      this.chartOption.yAxis.data = this.chartHelper.getCategoryData();
    }
  };

  // 设置是否展示图例
  this.setLegend = (legend) => {
    const chartGroups =
      this.chartOption.groupByColumn ? this.chartHelper.getGroupingData() : this.chartOption.valueColumns;
    this.chartOption.legend.data = legend ? chartGroups : [];
  };

  // 设置值列的最大值
  this.setValueMax = (maxValue) => {
    if (this.chartOption.xAxis.type === 'category') {
      this.chartOption.yAxis.max = maxValue;
    } else {
      this.chartOption.xAxis.max = maxValue;
    }
  };

  // 设置值列的最小值
  this.setValueMin = (min) => {
    if (this.chartOption.yAxis.type === 'category') {
      this.chartOption.xAxis.min = min;
    } else {
      this.chartOption.yAxis.min = min;
    }
  };

  // 设置图形series.data的值
  this.setSeriesData = (chartType) => {
    each(this.chartOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.chartOption.valueColumns, (item, index) => {
      this.chartOption.series[index] = {
        name: item,
        data: this.chartHelper.getValueData()[index],
        type: chartType,
        label: {
          normal: {
            show: false,
          },
        },
        lineStyle: {
          type: 'solid',
        },
      };
    });
  };

  // 根据列的数量是否倾斜显示x轴的文本，并根据标签的长度判断是否需要折行和底部间距的设置
  this.inclineContent = (horizontalBar) => {
    if (horizontalBar) {
      this.chartOption.grid.left = '80px';
      this.chartOption.yAxis.axisLabel = {
        formatter: params => setAxisLabel(params),
      };
    } else {
      const contentList = [];// 定义一个x轴文本列表
      each(this.chartHelper.getCategoryData(), (item) => {
        contentList.push(item.length);
      });
      const contentLongest = max(contentList);// 获取x轴文本中的最大长度

      // 如果分类列数量大于7列，将倾斜展示x轴文本，且超过五个字将会折行
      if (this.chartHelper.getCategoryData().length > 7) {
        this.chartOption.xAxis.axisLabel = {
          rotate: -45,
          formatter: params => setAxisLabel(params),
        };
        // 根据最大长度进行底部间距的设置
        this.chartOption.grid.bottom = Math.ceil(contentLongest / 5) + 3 + '7px';
      }

      // 如果分类列数量小于等于7列，则水平显示x轴文本，且超过五个字将会折行
      if (this.chartHelper.getCategoryData().length <= 7) {
        this.chartOption.xAxis.axisLabel = {
          formatter: params => setAxisLabel(params),
        };
        // 根据最大长度进行底部间距的设置
        this.chartOption.grid.bottom = Math.ceil(contentLongest / 5) + 3 + '0px';
      }
    }
  };

  // 是否选择堆叠
  this.setStack = (isStack) => {
    each(this.chartOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.chartOption.valueColumns, (item, index) => {
      if (isStack) {
        this.chartOption.series[index].stack = 'stack';
      } else {
        this.chartOption.series[index].stack = null;
      }
    });
  };

  // 是否在图形上显示值（散点图需要setTop这个参数，防止图形与数字重叠）
  this.setShowValueLabel = (showLabel, setTop) => {
    each(this.chartOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.chartOption.valueColumns, (item, index) => {
      this.chartOption.series[index].label.normal.show = showLabel;
      if (setTop) this.chartOption.series[index].label.normal.position = 'top';
    });
  };

  // 折线图切换为面积折线图
  this.setAreaStyle = (areaStyle) => {
    each(this.chartOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.chartOption.valueColumns, (item, index) => {
      if (areaStyle) {
        this.chartOption.series[index].areaStyle = {};
      } else {
        this.chartOption.series[index].areaStyle = null;
      }
    });
  };

  // 折线图切换为平滑折线图
  this.setSmoothStyle = (smoothStyle) => {
    each(this.chartOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.chartOption.valueColumns, (item, index) => {
      this.chartOption.series[index].smooth = smoothStyle;
    });
  };

  // 改变折线图线的类型
  this.setLineStyle = (lineStyle) => {
    each(this.chartOption.groupByColumn ?
      this.chartHelper.getGroupingData() : this.chartOption.valueColumns, (item, index) => {
      if (lineStyle === 'solid') this.chartOption.series[index].lineStyle.type = 'solid';
      if (lineStyle === 'dashed') this.chartOption.series[index].lineStyle.type = 'dashed';
      if (lineStyle === 'dotted') this.chartOption.series[index].lineStyle.type = 'dotted';
    });
  };

  // 设置图形标线
  this.setMarkLine = (markLineValue) => {
    this.chartOption.series[0].markLine = {
      data: [
        {
          yAxis: markLineValue,
        },
      ],
      itemStyle: {
        normal: {
          lineStyle: {
            type: 'solid',
            color: '#E92828',
            width: 2,
          },
        },
      },
    };
  };

  // 设置图形标线的颜色
  this.setMarkLineColor = (markLineColor) => {
    this.chartOption.series[0].markLine.itemStyle.normal.lineStyle.color = markLineColor;
  };
}

function BarOption() {
  BaseChartOption.call(this);
}

function LineOption() {
  BaseChartOption.call(this);
}

function ScatterOption() {
  BaseChartOption.call(this);
}

export { BarOption, LineOption, ScatterOption };
