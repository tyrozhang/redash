import { each } from 'lodash';
import template from './embed-code-dialog.html';

const EmbedCodeDialog = {
  controller(clientConfig, $window, $scope) {
    'ngInject';

    this.query = this.resolve.query;

    // 将查询参数拼接到url中
    let params = '';
    each(this.query.options.parameters, (item) => {
      params += '&p_' + item.name + '=' + item.value;
    });
    this.visualization = this.resolve.visualization;
    this.queryResult = this.resolve.queryResult;
    this.useFilter = false;

    // 默认为显示标题
    this.showTitle = true;
    const defaultEmbedUrI = `${clientConfig.basePath}embed/query/${this.query.id}/visualization/${
      this.visualization.id
    }?api_key=${this.query.api_key}` + params;
    this.embedUrl = defaultEmbedUrI;
    this.titleParameter = '';
    this.themeParameter = '';

    this.isShowTitle = () => {
      this.titleParameter = '';
      if (!this.showTitle) {
        this.titleParameter = '&show_title=false';
      }
      this.embedUrl = defaultEmbedUrI + this.titleParameter + this.themeParameter;
    };

    this.setEmbedUrl = () => {
      this.themeParameter = '';
      if (this.theme) {
        this.themeParameter = '&theme=' + this.theme;
      }
      this.embedUrl = defaultEmbedUrI + this.titleParameter + this.themeParameter;
    };

    if (window.snapshotUrlBuilder) {
      this.snapshotUrl = window.snapshotUrlBuilder(this.query, this.visualization);
    }

    // 复制iframe标签与内容
    this.copyKey = () => {
      const target = document.getElementById('iFrameUrl').innerText;
      const input = document.getElementById('iFrameInput');
      input.value = target;
      input.select();
      document.execCommand('copy');
      $window.confirm('复制成功');
    };

    // 换肤功能
    this.themes = ['theme-dark', 'theme-green', 'theme-red'];

    this.removeTheme = () => {
      const oldLink = document.getElementById('embed_themes');
      if (oldLink) {
        oldLink.parentNode.removeChild(oldLink);
      }
    };

    this.changeTheme = (theme) => {
      this.theme = theme;
      this.setEmbedUrl();
      this.removeTheme();
      const link = document.createElement('link');

      link.rel = 'stylesheet';
      link.href = './static/' + theme + '.css';
      link.id = 'embed_themes';

      document.head.appendChild(link);
    };
    this.resetTheme = () => {
      this.theme = '';
      this.setEmbedUrl();
    };

    $scope.$on('$destroy', () => {
      this.removeTheme();
    });
  },
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  template,
};

export default function init(ngModule) {
  ngModule.component('embedCodeDialog', EmbedCodeDialog);
}

init.init = true;
