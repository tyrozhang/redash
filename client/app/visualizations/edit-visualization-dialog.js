import { map } from 'lodash';
import { copy } from 'angular';
import template from './edit-visualization-dialog.html';

const EditVisualizationDialog = {
  template,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  controller($window, currentUser, Events, Visualization, toastr) {
    'ngInject';

    this.query = this.resolve.query;
    this.queryResult = this.resolve.queryResult;
    this.originalVisualization = this.resolve.visualization;
    this.onNewSuccess = this.resolve.onNewSuccess;
    this.visualization = copy(this.originalVisualization);
    this.visTypes = Visualization.visualizationTypes;

    // Don't allow to change type after creating visualization
    this.canChangeType = !(this.visualization && this.visualization.id);

    this.newVisualization = () =>
      ({
        type: Visualization.defaultVisualization.type,
        name: Visualization.defaultVisualization.name,
        description: '',
        options: Visualization.defaultVisualization.defaultOptions,
      });
    if (!this.visualization) {
      this.visualization = this.newVisualization();
    }

    this.typeChanged = (oldType) => {
      const type = this.visualization.type;
      // if not edited by user, set name to match type
      // todo: this is wrong, because he might have edited it before.
      if (type && oldType !== type && this.visualization && !this.visForm.name.$dirty) {
        this.visualization.name = Visualization.visualizations[this.visualization.type].name;
      }

      // Bring default options
      if (type && oldType !== type && this.visualization) {
        this.visualization.options =
          Visualization.visualizations[this.visualization.type].defaultOptions;
      }
    };

    this.submit = () => {
      if (this.visualization.id) {
        Events.record('update', 'visualization', this.visualization.id, { type: this.visualization.type });
      } else {
        Events.record('create', 'visualization', null, { type: this.visualization.type });
      }

      this.visualization.query_id = this.query.id;

      Visualization.save(this.visualization, (result) => {
        toastr.success('数据可视化已保存');

        const visIds = map(this.query.visualizations, i => i.id);
        const index = visIds.indexOf(result.id);
        if (index > -1) {
          this.query.visualizations[index] = result;
        } else {
          // new visualization
          this.query.visualizations.push(result);
          if (this.onNewSuccess) {
            this.onNewSuccess(result);
          }
        }
        this.close();
      }, () => {
        toastr.error('此可视化无法被保存');
      });
    };

    this.closeDialog = () => {
      if (this.visForm.$dirty) {
        if ($window.confirm('您确定不保存并关闭编辑器吗?')) {
          this.close();
        }
      } else {
        this.close();
      }
    };
  },
};

export default function init(ngModule) {
  ngModule.component('editVisualizationDialog', EditVisualizationDialog);
}
