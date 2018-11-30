import { each } from 'lodash';

const provincePosition = {
  浙江: [120.10, 29.10],
  云南: [101.30, 24.14],
  新疆: [85.65, 42.00],
  香港: [0, 0],
  西藏: [89.11, 31.10],
  台湾: [120.95, 23.65],
  四川: [102.89, 30.27],
  陕西: [108.76, 34.11],
  山西: [112.38, 37.69],
  山东: [118.43, 36.17],
  青海: [96.47, 35.72],
  宁夏: [105.98, 37.36],
  辽宁: [123.51, 41.47],
  江西: [115.63, 27.73],
  吉林: [126.45, 43.50],
  湖南: [111.57, 28.01],
  湖北: [113.03, 30.89],
  河南: [113.58, 33.80],
  海南: [109.77, 19.22],
  贵州: [106.61, 26.66],
  广西: [108.41, 23.01],
  甘肃: [103.79, 35.94],
  福建: [118.02, 26.00],
  澳门: [117.18, 32.01],
  上海: [121.68, 31.21],
  重庆: [107.76, 29.79],
  江苏: [119.96, 32.47],
  广东: [113.35, 23.27],
  河北: [115.40, 38.22],
  北京: [116.44, 40.22],
  天津: [117.34, 39.22],
  黑龙江: [127.88, 46.77],
  内蒙古: [111.07, 41.38],
};

function ChartDataHelper() {
  let categoryColumn;
  let valueColumn;
  let queryResult;

  ChartDataHelper.prototype.init = (result, categoryCol, valueCol) => {
    categoryColumn = categoryCol;
    valueColumn = valueCol;
    queryResult = result;
  };

  ChartDataHelper.prototype.getCategoryData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[categoryColumn]);
    });
    return data;
  };

  ChartDataHelper.prototype.getValueData = () => {
    const data = [];
    each(queryResult, (item) => {
      data.push(item[valueColumn]);
    });
    return data;
  };
}

function MapOption() {
  this.mapOption = {
    geo: {
      map: 'china',
    },
    series: [
      {
        type: 'map',
        mapType: 'china',
        // roam: true,
        itemStyle: {
          normal: {
            color: 'rgba(255, 255, 255, 0)',
            // areaColor: 'red',
            borderColor: '#C0C0C0',
          },
          emphasis: {
            areaColor: '#9BC482',
            color: 'rgba(255, 255, 255, 0)',
            borderColor: 'rgba(255, 255, 255, 0)',
          },
        },
        label: {
          emphasis: {
            show: true,
            fontSize: 13,
          },
        },
      },
      {
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: [],
        symbolSize: 12,
        label: {
          normal: {
            show: true,
            formatter: params => params.name + ':' + params.value[2],
            position: 'top',
          },
        },
        itemStyle: {
          normal: {
            color: '#21A3F6',
          },
        },
      },
    ],
  };

  this.chartDataHelper = new ChartDataHelper();

  this.setOptionData = () => {
    const optionData = [];
    each(this.chartDataHelper.getCategoryData(), (item, index) => {
      provincePosition[item].push(this.chartDataHelper.getValueData()[index]);
      optionData.push({
        name: item,
        value: provincePosition[item],
      });
    });
    this.mapOption.series[1].data = optionData;
  };
}


export { MapOption, ChartDataHelper };
