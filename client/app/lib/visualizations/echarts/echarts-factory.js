import * as echarts from 'echarts';
// import blue from '@/lib/visualizations/echarts/themes/blue';
// import blueness from '@/lib/visualizations/echarts/themes/blueness';
import green from '@/lib/visualizations/echarts/themes/green';
// import purple from '@/lib/visualizations/echarts/themes/purple';
import red from '@/lib/visualizations/echarts/themes/red';
// import sea from '@/lib/visualizations/echarts/themes/sea';
import 'echarts/theme/shine';

function getTheme(changeTheme) {
  let theme;
  if (changeTheme === 'theme-dark') {
    theme = 'dark';
  }
  if (changeTheme === 'theme-green') {
    theme = green;
  }
  if (changeTheme === 'theme-red') {
    theme = red;
  }
  return theme;
}

export default function EchartsFactory(location, currentUser, theme) {
  const _location = location;
  const _currentUser = currentUser;
  EchartsFactory.prototype.createChart = (container) => {
    const url = _location.url();

    if (url.indexOf('large_screen') !== -1) {
      return echarts.init(container, 'dark');
    }
    return echarts.init(container, getTheme(theme));
  };
  EchartsFactory.prototype.setOption = (echartObj, option) => {
    const url = _location.url();

    if (url.indexOf('large_screen') !== -1) {
      option.backgroundColor = 'rgba(0, 0, 0, 0)';
    }

    if (theme === 'theme-dark') {
      option.backgroundColor = 'rgba(0, 0, 0, 0)';
    }

    echartObj.setOption(option, true);
  };

  // 此方法为预留方法，没有任何实现目标，尚未用到。
  EchartsFactory.prototype.user = () => {
    _currentUser.name = '';
    return _currentUser;
  };
}
