import template from './large-screen-widget.html';
import './widget.less';

function DashboardWidgetCtrl($location, $uibModal, $window, Events, currentUser) {
  this.canViewQuery = currentUser.hasPermission('view_query');

  this.localParametersDefs = () => {
    if (!this.localParameters) {
      this.localParameters = this.widget
        .getQuery()
        .getParametersDefs()
        .filter(p => !p.global);
    }
    return this.localParameters;
  };

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

init.init = true;
