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

function ProgressOption() {
  this.progressOption = {
    silent: true,
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
            // color: '#F57474',
            barBorderRadius: 15,
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
            color: 'yellow',
            borderColor: '#56D0E3',
            barBorderRadius: 15,
            borderWidth: 2,
          },
        },
        label: {
          show: true,
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
}

export { ChartDataHelper, ProgressOption };
