import { each, round } from 'lodash';

function ChartDataHelper() {
  let categoryColumn;
  let valuesColumn;
  let queryResult;
  let totalValueColumn;

  ChartDataHelper.prototype.init = (result, categoryCol, valueCol, totalCol) => {
    categoryColumn = categoryCol;
    valuesColumn = valueCol;
    totalValueColumn = totalCol;
    queryResult = result;
  };

  ChartDataHelper.prototype.getCategoryData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[categoryColumn]);
    });
    return data;
  };

  ChartDataHelper.prototype.getValuesData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[valuesColumn]);
    });
    return data;
  };

  ChartDataHelper.prototype.getTotalValuesData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[totalValueColumn]);
    });
    return data;
  };
}

// 对x轴文本进行判断，如果超过5个字将折行显示
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

function ProgressOption() {
  this.progressOption = {
    silent: true,
    grid: {
      top: '30px',
      left: '70px',
      right: '50px',
      bottom: '20px',
    },
    xAxis: [{
      show: false,
    }],
    yAxis: {
      show: true,
      inverse: true,
      data: [],
      axisLine: {
        show: false,
      },
      axisPointer: {
        show: false,
      },
      axisTick: {
        show: false,
      },
    },
    series: [
      {
        // 柱
        data: [],
        type: 'bar',
        z: 3,
        barCategoryGap: '30%',
        itemStyle: {
          normal: {
            color: '#EF9818',
            barBorderRadius: 5,
          },
        },
        label: {},
      },
      {
        // 框
        data: [],
        type: 'bar',
        barGap: '-100%',
        barCategoryGap: '30%',
        itemStyle: {
          normal: {
            color: '#989BA2',
            borderColor: '#393939',
            barBorderRadius: 5,
            borderWidth: 2,
          },
        },
        label: {
          show: false,
          color: '#56D0E3',
          position: 'right',
          formatter: '{c}',
        },
      },
    ],
  };

  this.chartHelper = new ChartDataHelper();

  this.setProgressOption = () => {
    // 给Option中放入数据
    this.progressOption.yAxis.data = this.chartHelper.getCategoryData();
    this.progressOption.series[0].data = this.chartHelper.getValuesData();
    this.progressOption.series[1].data = this.chartHelper.getTotalValuesData();
    // 获取百分比数据的数组
    const proList = [];
    each(this.chartHelper.getCategoryData(), (item, index) => {
      proList.push(round(this.chartHelper.getValuesData()[index] / this.chartHelper.getTotalValuesData()[index] * 100));
    });
    // 设置显示在柱状图上的值
    this.progressOption.series[0].label.normal = {
      show: true,
      position: 'inside',
      formatter: params => proList[params.dataIndex] + '%',
    };
    // 如果数据少于4组，给柱状图的大小设置固定值
    if (this.chartHelper.getCategoryData().length < 4) {
      this.progressOption.series[0].barWidth = 30;
      this.progressOption.series[1].barWidth = 31;
      this.progressOption.yAxis.axisLabel = {
        fontSize: 16,
      };
    }
  };

  this.setAxisLabel = () => {
    this.progressOption.yAxis.axisLabel = {
      interval: 0,
      formatter: params => setAxisLabel(params),
    };
  };
}

export default ProgressOption;
