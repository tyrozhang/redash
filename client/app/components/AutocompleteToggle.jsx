import React from 'react';
import Tooltip from 'antd/lib/tooltip';
import PropTypes from 'prop-types';
import '@/redash-font/style.less';
import recordEvent from '@/services/recordEvent';

export default function AutocompleteToggle({ state, disabled, onToggle }) {
  let tooltipMessage = '已启用实时自动填充功能';
  let icon = 'icon-flash';
  if (!state) {
    tooltipMessage = '已禁用实时自动填充功能';
    icon = 'icon-flash-off';
  }

  if (disabled) {
    tooltipMessage = '无法使用实时自动填充功能 (可使用 Ctrl+Space 激活)';
    icon = 'icon-flash-off';
  }

  const toggle = (newState) => {
    recordEvent('toggle_autocomplete', 'screen', 'query_editor', { state: newState });
    onToggle(newState);
  };

  return (
    <Tooltip placement="top" title={tooltipMessage}>
      <button
        type="button"
        className={'btn btn-default m-r-5' + (disabled ? ' disabled' : '')}
        onClick={() => toggle(!state)}
        disabled={disabled}
      >
        <i className={'icon ' + icon} />
      </button>
    </Tooltip>
  );
}

AutocompleteToggle.propTypes = {
  state: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};
