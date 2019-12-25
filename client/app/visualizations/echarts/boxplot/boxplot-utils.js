import { each } from 'lodash';
import { prepareBoxplotData } from 'echarts/extension/dataTool';

function ChartDataHelper() {
  let valuesColumns;
  let queryResult;

  ChartDataHelper.prototype.init = (result, values) => {
    valuesColumns = values;
    queryResult = result;
  };

  ChartDataHelper.prototype.getValuesData = () => {
    const plotData = [];
    each(valuesColumns, (column) => {
      const data = [];
      each(queryResult, (item) => {
        data.push(parseInt(item[column], 10));
      });
      plotData.push(data);
    });
    return plotData;
  };
}

function BoxPlotOption() {
  this.chartOption = {
    title: [
      {
        text: '',
        left: 'center',
      },
    ],
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
    },
    xAxis: {
      type: 'category',
      data: [],
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false,
      },
      axisLabel: {
        formatter: '{value}',
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: '',
      splitArea: {
        show: true,
      },
    },
    series: [
      {
        name: 'boxplot',
        type: 'boxplot',
        data: [],
        tooltip: {
          formatter: param => [
            param.name + ':',
            '最大值: ' + param.data[5],
            '上四分位数: ' + param.data[4],
            '中位数: ' + param.data[3],
            '下四分位数: ' + param.data[2],
            '最小值: ' + param.data[1],
          ].join('<br/>'),
        },
      },
      {
        name: '异常值',
        type: 'scatter',
        data: [],
      },
    ],
  };

  this.chartHelper = new ChartDataHelper();

  this.setBoxPlotData = () => {
    this.bpdata = this.chartHelper.getValuesData();

    const axisData = prepareBoxplotData(this.bpdata).axisData;
    const boxData = prepareBoxplotData(this.bpdata).boxData;
    const outliers = prepareBoxplotData(this.bpdata).outliers;

    this.chartOption.xAxis.data = axisData;
    this.chartOption.series[0].data = boxData;
    this.chartOption.series[1].data = outliers;
  };

  this.setXAxisLabel = (value) => {
    if (value) {
      this.chartOption.xAxis.data = value;
    }
  };
}

export default BoxPlotOption;
