import * as echarts from 'echarts';

export default function EchartsFactory(location, currentUser) {
  const _location = location;
  const _currentUser = currentUser;

  EchartsFactory.prototype.init = (container) => {
    const url = _location.url();

    if (url.indexOf('large_screen') !== -1) {
      return echarts.init(container, 'dark');
    }
    return echarts.init(container);
  };

  EchartsFactory.prototype.setOption = (echartObj, option, flag) => {
    const url = _location.url();

    if (url.indexOf('large_screen') !== -1) {
      option.backgroundColor = 'rgba(0, 0, 0, 0)';
    }
    echartObj.setOption(option, flag);
  };

  // 此方法为预留方法，没有任何实现目标，尚未用到。
  EchartsFactory.prototype.user = () => {
    _currentUser.name = '';
    return _currentUser;
  };
}
