import debug from 'debug';

import logoUrl from '@/assets/images/redash_icon_small.png';
// import cyan from '@/lib/visualizations/echarts/cyan';
// import blue from '@/lib/visualizations/echarts/themes/blue';
// import blueness from '@/lib/visualizations/echarts/themes/blueness';
// import purple from '@/lib/visualizations/echarts/themes/purple';
// import green from '@/lib/visualizations/echarts/themes/green';
// import red from '@/lib/visualizations/echarts/themes/red';
import sea from '@/lib/visualizations/echarts/themes/sea';

import template from './app-header.html';
import './app-header.css';

const logger = debug('redash:appHeader');

function controller($rootScope, $location, $route, $uibModal, Auth, currentUser, clientConfig, Dashboard, Query) {
  this.logoUrl = logoUrl;
  this.basePath = clientConfig.basePath;
  this.currentUser = currentUser;
  this.showQueriesMenu = currentUser.hasPermission('view_query');
  this.showAlertsLink = currentUser.hasPermission('list_alerts');
  this.showNewQueryMenu = currentUser.hasPermission('create_query');
  this.showSettingsMenu = currentUser.hasPermission('list_users');
  this.showDashboardsMenu = currentUser.hasPermission('list_dashboards');

  this.reload = () => {
    logger('Reloading dashboards and queries.');
    Dashboard.favorites().$promise.then((data) => {
      this.dashboards = data.results;
    });
    Query.favorites().$promise.then((data) => {
      this.queries = data.results;
    });
  };

  this.reload();

  $rootScope.$on('reloadFavorites', this.reload);

  this.newDashboard = () => {
    $uibModal.open({
      component: 'editDashboardDialog',
      resolve: {
        dashboard: () => ({ name: null, layout: null }),
      },
    });
  };

  this.searchQueries = () => {
    $location.path('/queries').search({ q: this.searchTerm });
    $route.reload();
  };

  this.logout = () => {
    Auth.logout();
  };
  // 定义通过webpack打包之后的样式文件的名称
  this.themes = ['theme-black', 'theme-green', 'theme-red'];

  // 删除引用样式的link标签
  this.removeTheme = () => {
    const oldLink = document.getElementById('dashboard_themes');
    if (oldLink) {
      oldLink.parentNode.removeChild(oldLink);
    }
  };

  // 当点击主题按钮时，动态的引入对应的主题样式
  this.changeTheme = (theme) => {
    this.removeTheme();

    // $rootScope.theme = theme.split('-')[1];
    if (theme === 'theme-black') {
      $rootScope.theme = 'dark';
      // $rootScope.theme = green;
    }
    if (theme === 'theme-green') {
      $rootScope.theme = sea;
      // $rootScope.theme = red;
    }
    if (theme === 'theme-red') {
      $rootScope.theme = 'shine';
      // $rootScope.theme = sea;
    }
    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href = './static/' + theme + '.css';
    link.id = 'dashboard_themes';

    document.head.appendChild(link);
  };

  // 初始按钮的作用，清除自定义样式引用，使用默认样式
  this.resetTheme = () => {
    this.removeTheme();
    $rootScope.theme = '';
  };
}

export default function init(ngModule) {
  ngModule.component('appHeader', {
    template,
    controller,
  });
}

init.init = true;
