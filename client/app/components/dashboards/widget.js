import { filter } from 'lodash';
import template from './widget.html';
import editTextBoxTemplate from './edit-text-box.html';
import widgetDialogTemplate from './widget-dialog.html';
import './widget.less';
import './widget-dialog.less';

const WidgetDialog = {
  template: widgetDialogTemplate,
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&',
  },
  controller() {
    this.widget = this.resolve.widget;
    this.dashboard = this.resolve.dashboard;

    this.useFilter = () => {
      if (this.dashboard.dashboard_filters_enabled) {
        return false;
      }
      return true;
    };
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

function DashboardWidgetCtrl($location, $uibModal, $window, $rootScope, Events, currentUser) {
  this.canViewQuery = currentUser.hasPermission('view_query');

  this.editTextBox = () => {
    this.widget.existing_text = this.widget.text;
    this.widget.new_text = this.widget.text;
    $uibModal.open({
      component: 'editTextBox',
      resolve: {
        widget: this.widget,
      },
    });
  };

  this.expandVisualization = () => {
    $uibModal.open({
      component: 'widgetDialog',
      resolve: {
        widget: this.widget,
        dashboard: this.dashboard,
      },
      size: 'lg',
    });
  };

  this.hasParameters = () => this.widget.query.getParametersDefs().length > 0;

  this.editParameterMappings = () => {
    $uibModal.open({
      component: 'editParameterMappingsDialog',
      resolve: {
        dashboard: this.dashboard,
        widget: this.widget,
      },
      size: 'lg',
    }).result.then(() => {
      this.localParameters = null;
      $rootScope.$broadcast('dashboard.update-parameters');
    });
  };

  this.localParametersDefs = () => {
    if (!this.localParameters) {
      this.localParameters = filter(
        this.widget.getParametersDefs(),
        param => !this.widget.isStaticParam(param),
      );
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

  this.useFilter = () => {
    if (this.dashboard.dashboard_filters_enabled) {
      return false;
    }
    return true;
  };
}

export default function init(ngModule) {
  ngModule.component('editTextBox', EditTextBoxComponent);
  ngModule.component('widgetDialog', WidgetDialog);
  ngModule.component('dashboardWidget', {
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

init.init = true;

