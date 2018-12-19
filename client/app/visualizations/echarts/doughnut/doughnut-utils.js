import { each, sum, round } from 'lodash';

function ChartDataHelper() {
  let categoryColumn;
  let valuesColumn;
  let queryResult;

  ChartDataHelper.prototype.init = (result, xAxis, yAxis) => {
    categoryColumn = xAxis;
    valuesColumn = yAxis;
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
      data.push(parseInt(item[valuesColumn], 10));
    });
    return data;
  };
}

function DoughnutOption() {
  // 定义了占位数据在环图中的颜色
  const labelBottom = {
    normal: {
      color: '#E0E3E9',
    },
  };
  // 根据圆的个数对应不同的位置
  const circleCenter = [
    // 1个
    [['50%', '50%']],
    // 2个
    [['30%', '50%'],
      ['70%', '50%']],
    // 3个
    [['25%', '50%'],
      ['50%', '50%'],
      ['75%', '50%']],
    // 4个
    [['35%', '30%'],
      ['65%', '30%'],
      ['35%', '70%'],
      ['65%', '70%']],
    // 5个
    [['25%', '30%'],
      ['50%', '30%'],
      ['75%', '30%'],
      ['25%', '70%'],
      ['50%', '70%']],
    // 6个
    [['25%', '30%'],
      ['50%', '30%'],
      ['75%', '30%'],
      ['25%', '70%'],
      ['50%', '70%'],
      ['75%', '70%']],
  ];
  // 根据圆的个数对应不同的圆的大小
  const circleRadius = [
    ['', ''], ['37%', '42%'], ['35%', '40%'], ['30%', '35%'], ['25%', '30%'], ['25%', '30%'],
  ];
  // 根据圆的个数对应不同的字体大小（环图中心的名称字体）
  const circleFontSize = [20, 18, 12, 12, 11, 11];

  this.pieOption = {
    legend: {
      orient: 'vertical',
      x: 'right',
      data: [],
    },
    series: [{
      type: 'pie',
    }],
  };

  this.chartHelper = new ChartDataHelper();

  this.setDoughnutData = () => {
    // 根据数据的条数来确定圆的个数、位置、大小、字体
    const pieNumber = this.chartHelper.getCategoryData().length - 1;
    const pieCenter = circleCenter[pieNumber];
    const pieRadius = circleRadius[pieNumber];
    const pieFontSize = circleFontSize[pieNumber];
    // 算出数据列之和
    const valueTotal = sum(this.chartHelper.getValuesData());
    // 向series中添加数据
    each(this.chartHelper.getCategoryData(), (item, index) => {
      const Value = this.chartHelper.getValuesData()[index];
      this.pieOption.series[index] = {
        type: 'pie',
        center: pieCenter[index],
        radius: pieRadius,
        silent: true,
        label: {
          normal: {
            position: 'center',
          },
        },
        data: [
          {
            value: Value,
            name: item,
            label: {
              normal: {
                textStyle: {
                  padding: [0, 0, 3, 0],
                  fontSize: pieFontSize,
                },
              },
            },
          },
          {
            value: (valueTotal - Value),
            name: '占位',
            itemStyle: labelBottom,
            label: {
              normal: {
                formatter: round((Value / valueTotal) * 100, 2) + '%',
                textStyle: {
                  fontSize: 13,
                  color: '#72ACD1',
                },
              },
            },
          },
        ],
      };
    });
  };

  this.setLegend = (hasLegend) => {
    if (hasLegend) {
      this.pieOption.legend.data = this.chartHelper.getCategoryData();
    } else {
      this.pieOption.legend.data = [];
    }
  };
}

export default DoughnutOption;
