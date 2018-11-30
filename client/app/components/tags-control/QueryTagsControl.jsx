import { react2angular } from 'react2angular';
import ModelTagsControl from '@/components/tags-control/ModelTagsControl';

export class QueryTagsControl extends ModelTagsControl {
  static archivedTooltip = '此查询已删除，将不能在仪表盘中使用，也不会出现在搜索结果中。';
}

export default function init(ngModule) {
  ngModule.component('queryTagsControl', react2angular(QueryTagsControl, null, ['$uibModal']));
}

init.init = true;
