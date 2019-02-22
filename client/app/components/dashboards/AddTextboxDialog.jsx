import { markdown } from 'markdown';
import { debounce } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { toastr } from '@/services/ng';
import { Widget } from '@/services/widget';

class AddTextboxDialog extends React.Component {
  static propTypes = {
    dashboard: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    close: PropTypes.func,
    dismiss: PropTypes.func,
  };

  static defaultProps = {
    dashboard: null,
    close: () => {},
    dismiss: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      saveInProgress: false,
      text: '',
      preview: '',
    };

    const updatePreview = debounce(() => {
      const text = this.state.text;
      this.setState({
        preview: markdown.toHTML(text),
      });
    }, 100);

    this.onTextChanged = (event) => {
      this.setState({ text: event.target.value });
      updatePreview();
    };
  }

  saveWidget() {
    const dashboard = this.props.dashboard;

    this.setState({ saveInProgress: true });

    const widget = new Widget({
      visualization_id: null,
      dashboard_id: dashboard.id,
      options: {
        isHidden: false,
        position: {},
      },
      visualization: null,
      text: this.state.text,
    });

    const position = dashboard.calculateNewWidgetPosition(widget);
    widget.options.position.col = position.col;
    widget.options.position.row = position.row;

    widget
      .save()
      .then(() => {
        dashboard.widgets.push(widget);
        this.props.close();
      })
      .catch(() => {
        toastr.error('Widget can not be added');
      })
      .finally(() => {
        this.setState({ saveInProgress: false });
      });
  }

  render() {
    return (
      <div>
        <div className="modal-header">
          <button
            type="button"
            className="close"
            disabled={this.state.saveInProgress}
            aria-hidden="true"
            onClick={this.props.dismiss}
          >
            &times;
          </button>
          <h4 className="modal-title">添加文本框</h4>
        </div>
        <div className="modal-body">
          <div className="form-group m-b-0">
            <textarea
              className="form-control resize-vertical"
              style={{ minMeight: '100px' }}
              rows="5"
              value={this.state.text}
              onChange={this.onTextChanged}
            />
          </div>
          <div
            ng-show="$ctrl.text"
            className="m-t-15"
          >
            <strong>预览：</strong>
            <p
              dangerouslySetInnerHTML={{ __html: this.state.preview }} // eslint-disable-line react/no-danger
              className="word-wrap-break"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-default"
            disabled={this.state.saveInProgress}
            onClick={this.props.dismiss}
          >
            关闭
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={this.state.saveInProgress}
            onClick={() => this.saveWidget()}
          >
            添加到仪表盘
          </button>
        </div>
      </div>
    );
  }
}

export default function init(ngModule) {
  ngModule.component('addTextboxDialog', {
    template: `
      <add-textbox-dialog-impl 
        dashboard="$ctrl.resolve.dashboard"
        close="$ctrl.close"
        dismiss="$ctrl.dismiss"
      ></add-textbox-dialog-impl>
    `,
    bindings: {
      resolve: '<',
      close: '&',
      dismiss: '&',
    },
  });
  ngModule.component('addTextboxDialogImpl', react2angular(AddTextboxDialog));
}

init.init = true;
