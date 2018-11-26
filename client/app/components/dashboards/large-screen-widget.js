import template from './large-screen-widget.html';
import editTextBoxTemplate from './edit-text-box.html';
import widgetDialogTemplate from './widget-dialog.html';
import './widget.less';
import './widget-dialog.less';
import './add-widget-dialog.less';

const WidgetDialog = {
  template: widgetDialogTemplate,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  controller() {
    this.widget = this.resolve.widget;
  },
};

const EditTextBoxComponent = {
  template: editTextBoxTemplate,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  controller(toastr) {
    'ngInject';

    this.saveInProgress = false;
    this.widget = this.resolve.widget;
    this.saveWidget = () => {
      this.saveInProgress = true;
      if (this.widget.new_text !== this.widget.existing_text) {
        this.widget.text = this.widget.new_text;
        this.widget
          .save()
          .then(() => {
            this.close();
          })
          .catch(() => {
            toastr.error('小部件更新失败');
          })
          .finally(() => {
            this.saveInProgress = false;
          });
      } else {
        this.close();
      }
    };
  },
};

function DashboardWidgetCtrl($location, $uibModal, $window, Events, currentUser) {
  this.canViewQuery = currentUser.hasPermission('view_query');

  this.editTextBox = () => {
    this.widget.existing_text = this.widget.text;
    this.widget.new_text = this.widget.text;
    $uibModal.open({
      component: 'largeScreenEditTextBox',
      resolve: {
        widget: this.widget,
      },
    });
  };

  this.expandVisualization = () => {
    $uibModal.open({
      component: 'largeScreenWidgetDialog',
      resolve: {
        widget: this.widget,
      },
      size: 'lg',
    });
  };

  this.localParametersDefs = () => {
    if (!this.localParameters) {
      this.localParameters = this.widget
        .getQuery()
        .getParametersDefs()
        .filter(p => !p.global);
    }
    return this.localParameters;
  };

  this.deleteWidget = () => {
    if (!$window.confirm(`您确定要在仪表盘上删除 "${this.widget.getName()}" ?`)) {
      return;
    }

    this.widget.delete().then(() => {
      if (this.deleted) {
        this.deleted({});
      }
    });
  };

  Events.record('view', 'widget', this.widget.id);

  this.load = (refresh = false) => {
    const maxAge = $location.search().maxAge;
    this.widget.load(refresh, maxAge);
  };

  this.refresh = () => {
    this.load(true);
  };

  if (this.widget.visualization) {
    Events.record('view', 'query', this.widget.visualization.query.id, { dashboard: true });
    Events.record('view', 'visualization', this.widget.visualization.id, { dashboard: true });

    this.type = 'visualization';
    this.load();
  } else if (this.widget.restricted) {
    this.type = 'restricted';
  } else {
    this.type = 'textbox';
  }
}

export default function init(ngModule) {
  ngModule.component('largeScreenEditTextBox', EditTextBoxComponent);
  ngModule.component('largeScreenWidgetDialog', WidgetDialog);
  ngModule.component('largeScreenDashboardWidget', {
    template,
    controller: DashboardWidgetCtrl,
    bindings: {
      widget: '<',
      public: '<',
      dashboard: '<',
      deleted: '&onDelete',
    },
  });
}