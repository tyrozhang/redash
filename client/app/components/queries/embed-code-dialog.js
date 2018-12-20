import { each } from 'lodash';
import template from './embed-code-dialog.html';

const EmbedCodeDialog = {
  controller(clientConfig, $window) {
    'ngInject';

    this.query = this.resolve.query;

    // 将查询参数拼接到url中
    let params = '';
    each(this.query.options.parameters, (item) => {
      params += '&p_' + item.name + '=' + item.value;
    });
    this.visualization = this.resolve.visualization;

    // 默认为显示标题
    this.showTitle = true;
    const defaultEmbedUrI = `${clientConfig.basePath}embed/query/${this.query.id}/visualization/${
      this.visualization.id
    }?api_key=${this.query.api_key}` + params;
    this.embedUrl = defaultEmbedUrI;

    this.isShowTitle = () => {
      if (this.showTitle) {
        this.embedUrl = defaultEmbedUrI;
      } else {
        this.embedUrl = defaultEmbedUrI + '&show_title=false';
      }
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
